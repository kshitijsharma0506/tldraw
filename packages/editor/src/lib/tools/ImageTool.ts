import { TLShape, TLImageShape } from '../types'
import { Vec2d } from '@tldraw/primitives'
import { getRotatedAngle, validateRotation, rotateShape } from '../utils/rotation'

export class ImageTool extends BaseTool {
  override onRotate = (
    shape: TLImageShape,
    info: {
      center: Vec2d
      point: Vec2d
      snap: boolean
    }
  ): TLImageShape => {
    const { center, point, snap } = info

    // Validate inputs
    if (!shape || !center || !point) {
      return shape
    }

    try {
      // Additional validation for Vec2d instances
      if (!Vec2d.isValid(center) || !Vec2d.isValid(point)) {
        return shape
      }

      const rotatedShape = rotateShape(shape, center, point, snap)
      return rotatedShape as TLImageShape
    } catch (error) {
      console.warn('Image rotation failed:', error)
      return shape
    }
  }
}