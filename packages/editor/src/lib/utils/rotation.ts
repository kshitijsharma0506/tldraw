import { isShapeId, TLShape, TLShapeId, TLShapePartial } from '@tldraw/tlschema'
import { compact } from '@tldraw/utils'
import { Editor } from '../editor/Editor'
import { Mat } from '../primitives/Mat'
import { canonicalizeRotation } from '../primitives/utils'
import { Vec, VecLike } from '../primitives/Vec'
import { Vec2d } from '@tldraw/primitives'


/** @internal */
export function getRotationSnapshot({
	editor,
	ids,
}: {
	editor: Editor
	ids: TLShapeId[]
}): TLRotationSnapshot | null {
	const shapes = compact(ids.map((id) => editor.getShape(id)))
	const rotation = editor.getShapesSharedRotation(ids)
	const rotatedPageBounds = editor.getShapesRotatedPageBounds(ids)

	// todo: this assumes we're rotating the selected shapes
	// if we try to rotate shapes that aren't selected, this
	// will produce the wrong results

	// Return null if there are no selected shapes
	if (!rotatedPageBounds) {
		return null
	}

	const pageCenter = rotatedPageBounds.center.clone().rotWith(rotatedPageBounds.point, rotation)

	return {
		pageCenter,
		initialCursorAngle: pageCenter.angle(editor.inputs.originPagePoint),
		initialShapesRotation: rotation,
		shapeSnapshots: shapes.map((shape) => ({
			shape,
			initialPagePoint: editor.getShapePageTransform(shape.id)!.point(),
		})),
	}
}

/**
 * @internal
 **/
export interface TLRotationSnapshot {
	pageCenter: Vec
	initialCursorAngle: number
	initialShapesRotation: number
	shapeSnapshots: {
		shape: TLShape
		initialPagePoint: Vec
	}[]
}

/** @internal */
export function applyRotationToSnapshotShapes({
	delta,
	editor,
	snapshot,
	stage,
	centerOverride,
}: {
	delta: number
	snapshot: TLRotationSnapshot
	editor: Editor
	stage: 'start' | 'update' | 'end' | 'one-off'
	centerOverride?: VecLike
}) {
	const { pageCenter, shapeSnapshots } = snapshot

	editor.updateShapes(
		shapeSnapshots.map(({ shape, initialPagePoint }) => {
			// We need to both rotate each shape individually and rotate the shapes
			// around the pivot point (the average center of all rotating shapes.)

			const parentTransform = isShapeId(shape.parentId)
				? editor.getShapePageTransform(shape.parentId)!
				: Mat.Identity()

			const newPagePoint = Vec.RotWith(initialPagePoint, centerOverride ?? pageCenter, delta)

			const newLocalPoint = Mat.applyToPoint(
				// use the current parent transform in case it has moved/resized since the start
				// (e.g. if rotating a shape at the edge of a group)
				Mat.Inverse(parentTransform),
				newPagePoint
			)
			const newRotation = canonicalizeRotation(shape.rotation + delta)

			return {
				id: shape.id,
				type: shape.type,
				x: newLocalPoint.x,
				y: newLocalPoint.y,
				rotation: newRotation,
			}
		})
	)

	// Handle change

	const changes: TLShapePartial[] = []

	shapeSnapshots.forEach(({ shape }) => {
		const current = editor.getShape(shape.id)
		if (!current) return
		const util = editor.getShapeUtil(shape)

		if (stage === 'start' || stage === 'one-off') {
			const changeStart = util.onRotateStart?.(shape)
			if (changeStart) changes.push(changeStart)
		}

		const changeUpdate = util.onRotate?.(shape, current)
		if (changeUpdate) changes.push(changeUpdate)

		if (stage === 'end' || stage === 'one-off') {
			const changeEnd = util.onRotateEnd?.(shape, current)
			if (changeEnd) changes.push(changeEnd)
		}
	})

	if (changes.length > 0) {
		editor.updateShapes(changes)
	}
}


const SNAP_ANGLE = Math.PI / 12 // 15 degrees
/**
 * Calculates the angle of rotation from a center point to a given point.
 * If the `snap` parameter is true, the angle is snapped to the nearest multiple of `SNAP_ANGLE`.
 * Returns 0 if the input points are invalid or if the angle calculation fails.
 * 
 * @param center - The center point of rotation.
 * @param point - The point to which the angle is calculated.
 * @param snap - A boolean indicating whether to snap the angle to a predefined increment.
 * @returns The calculated angle in radians, or 0 if invalid.
 */
export function getRotatedAngle(
  center: Vec2d,
  point: Vec2d,
  snap: boolean
): number {
  if (!center || !point || !Vec2d.isValid(center) || !Vec2d.isValid(point)) {
    return 0
  }

  try {
    // Calculate vector from center to point
    const vector = Vec2d.Sub(point, center)
    
    // Check if vector is too small (near center)
    if (Vec2d.Len(vector) < 0.001) {
      return 0
    }

    // Calculate initial angle
    const angle = Vec2d.Angle(center, point)
    
    if (!isFinite(angle)) {
      return 0
    }

    // Handle snapping
    if (snap) {
      return Math.round(angle / SNAP_ANGLE) * SNAP_ANGLE
    }

    return angle
  } catch (error) {
    console.warn('Angle calculation failed:', error)
    return 0
  }
}

/**
 * Validates and normalizes a given angle to ensure it is within the 0 to 2π range.
 * Returns 0 if the input angle is invalid.
 * 
 * @param angle - The angle to validate and normalize.
 * @returns The normalized angle in radians, or 0 if invalid.
 */
export function validateRotation(angle: number): number {
  // Handle invalid inputs
  if (typeof angle !== 'number' || !isFinite(angle)) {
    return 0
  }
  
  // Normalize angle to 0-2π range
  let normalized = angle % (Math.PI * 2)
  
  // Ensure positive angle
  if (normalized < 0) {
    normalized += Math.PI * 2
  }
  
  // Additional safety check
  return isFinite(normalized) ? normalized : 0
}

/**
 * Rotates a given shape around a center point to a new position defined by another point.
 * The rotation angle is calculated and validated, and the shape's position is updated accordingly.
 * If the `snap` parameter is true, the angle is snapped to the nearest multiple of `SNAP_ANGLE`.
 * Returns the original shape if inputs are invalid or if the rotation fails.
 * 
 * @param shape - The shape to rotate.
 * @param center - The center point of rotation.
 * @param point - The point to which the shape is rotated.
 * @param snap - A boolean indicating whether to snap the angle to a predefined increment.
 * @returns The rotated shape with updated position and rotation angle.
 */
export function rotateShape(
  shape: TLShape,
  center: Vec2d,
  point: Vec2d,
  snap: boolean
): TLShape {
  if (!shape || !center || !point) {
    return shape
  }

  try {
    // Get and validate rotation angle
    const angle = validateRotation(getRotatedAngle(center, point, snap))
    
    // Calculate new point position
    const newPoint = Vec2d.RotWith(shape.point, center, angle)
    
    // Verify calculated point is valid
    if (!Vec2d.isValid(newPoint)) {
      return shape
    }

    return {
      ...shape,
      rotation: angle,
      point: newPoint
    }
  } catch (error) {
    console.warn('Shape rotation failed:', error)
    return shape
  }
}