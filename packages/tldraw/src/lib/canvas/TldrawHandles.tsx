import { TLHandlesProps, useEditor, useValue } from '@tldraw/editor'

/** @public */
export function TldrawHandles({ children }: TLHandlesProps) {
	const editor = useEditor()
	const shouldDisplayHandles = useValue(
		'shouldDisplayHandles',
		() =>
			editor.isInAny('select.idle', 'select.pointing_arrow_handle', 'select.pointing_line_handle'),
		[editor]
	)

	if (!shouldDisplayHandles) return null

	return <svg className="tl-user-handles tl-overlays__item">{children}</svg>
}
