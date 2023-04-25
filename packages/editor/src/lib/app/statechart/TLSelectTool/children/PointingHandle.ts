import { TLArrowShape } from '@tldraw/tlschema'
import { TLEventHandlers, TLPointerEventInfo } from '../../../types/event-types'
import { StateNode } from '../../StateNode'

export class PointingHandle extends StateNode {
	static override id = 'pointing_handle'

	info = {} as TLPointerEventInfo & { target: 'handle' }

	onEnter = (info: TLPointerEventInfo & { target: 'handle' }) => {
		this.info = info

		const initialTerminal = (info.shape as TLArrowShape).props[info.handle.id as 'start' | 'end']

		if (initialTerminal?.type === 'binding') {
			this.app.setHintingIds([initialTerminal.boundShapeId])
		}

		this.app.setCursor({ type: 'grabbing' })
	}

	onExit = () => {
		this.app.setHintingIds([])
		this.app.setCursor({ type: 'default' })
	}

	onPointerUp: TLEventHandlers['onPointerUp'] = () => {
		this.parent.transition('idle', this.info)
	}

	onPointerMove: TLEventHandlers['onPointerMove'] = () => {
		if (this.app.inputs.isDragging) {
			this.parent.transition('dragging_handle', this.info)
		}
	}

	override onCancel: TLEventHandlers['onCancel'] = () => {
		this.cancel()
	}

	override onComplete: TLEventHandlers['onComplete'] = () => {
		this.cancel()
	}

	override onInterrupt = () => {
		this.cancel()
	}

	private cancel() {
		this.parent.transition('idle', {})
	}
}
