import { TLPageId, useEditor } from '@tldraw/editor'
import { useCallback, useRef } from 'react'
import { TldrawUiInput } from '../primitives/TldrawUiInput'
/** @public */
export const PageItemInput = function PageItemInput({
	name,
	id,
	isCurrentPage,
}: {
	name: string
	id: TLPageId
	isCurrentPage: boolean
}) {
	const editor = useEditor()

	const rInput = useRef<HTMLInputElement | null>(null)

	const handleChange = useCallback(
		(value: string) => {
			editor.history.ephemeral(() => {
				editor.renamePage(id, value ? value : 'New Page')
			})
		},
		[editor, id]
	)

	const handleComplete = useCallback(
		(value: string) => {
			editor.mark('rename page')
			editor.renamePage(id, value || 'New Page')
		},
		[editor, id]
	)

	return (
		<TldrawUiInput
			className="tlui-page-menu__item__input"
			ref={(el) => (rInput.current = el)}
			defaultValue={name}
			onValueChange={handleChange}
			onComplete={handleComplete}
			onCancel={handleComplete}
			shouldManuallyMaintainScrollPositionWhenFocused
			autofocus={isCurrentPage}
			autoselect
		/>
	)
}
