import { Vec2d, VecLike } from '@tldraw/primitives'
import { TLScribble, Vec2dModel } from '@tldraw/tlschema'
import { TLTickEvent } from '../types/event-types'

export class ScribbleManager implements TLScribble {
	// Scribble properties
	state
	points
	size
	color
	opacity

	// Callbacks
	private onUpdate: (scribble: TLScribble) => void
	private onComplete: () => void

	// Internal state
	private prev: VecLike | null = null
	private next: VecLike | null = null

	constructor(opts: {
		onUpdate: (scribble: TLScribble) => void
		onComplete: () => void
		size?: TLScribble['size']
		color?: TLScribble['color']
		opacity?: TLScribble['opacity']
	}) {
		const { size = 20, color = 'accent', opacity = 0.8, onComplete, onUpdate } = opts

		this.onUpdate = onUpdate
		this.onComplete = onComplete
		this.size = size
		this.color = color
		this.opacity = opacity
		this.points = [] as Vec2dModel[]
		this.state = 'starting' as TLScribble['state']

		this.prev = null
		this.next = null

		this.resume()
	}

	resume = () => {
		this.state = 'active'
	}

	pause = () => {
		this.state = 'starting'
	}

	/**
	 * Start stopping the scribble. The scribble won't be removed until its last point is cleared.
	 *
	 * @public
	 */
	stop = () => {
		this.state = 'stopping'
	}

	/**
	 * Set the scribble's next point.
	 *
	 * @param point - The point to add.
	 * @public
	 */
	addPoint = (x: number, y: number) => {
		const { prev } = this
		const point = { x, y, z: 0.5 }
		if (prev && Vec2d.Dist(prev, point) < 1) return
		this.next = point
	}

	/**
	 * Get the current TLScribble object from the scribble manager.
	 *
	 * @public
	 */
	getScribble(): TLScribble {
		return {
			state: this.state,
			size: this.size,
			color: this.color,
			opacity: this.opacity,
			points: [...this.points],
		}
	}

	private updateScribble() {
		this.onUpdate(this.getScribble())
	}

	timeoutMs = 0

	tick: TLTickEvent = (elapsed) => {
		this.timeoutMs += elapsed
		if (this.timeoutMs >= 16) {
			this.timeoutMs = 0
		}

		const { timeoutMs, state, prev, next, points } = this

		switch (state) {
			case 'active': {
				if (next && next !== prev) {
					this.prev = next
					points.push(next)

					if (points.length > 8) {
						points.shift()
					}

					this.updateScribble()
				} else {
					// While not moving, shrink the scribble from the start
					if (timeoutMs === 0 && points.length > 1) {
						points.shift()
						this.updateScribble()
					}
				}
				break
			}
			case 'stopping': {
				if (timeoutMs === 0) {
					// If the scribble is down to one point, we're done!
					if (points.length === 1) {
						this.state = 'paused'
						this.onComplete()
						return
					}

					// Drop the scribble's size
					this.size *= 0.9

					// Drop the scribble's first point (its tail)
					points.shift()

					// otherwise, update the scribble
					this.updateScribble()
				}
				break
			}
			case 'paused': {
				// Nothing to do while paused.
				break
			}
		}
	}
}
