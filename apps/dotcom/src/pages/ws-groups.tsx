import { useValue } from 'tldraw'
import '../../styles/globals.css'
import { TlaPageControls } from '../components-tla/TlaPageControls'
import { TlaSpacer } from '../components-tla/TlaSpacer'
import { TlaWrapper } from '../components-tla/TlaWrapper'
import { useApp } from '../hooks/useAppState'

export function Component() {
	const app = useApp()
	const groups = useValue(
		'groups',
		() => {
			const { auth } = app.getSessionState()
			if (!auth) return
			const files = app.getUserSharedFiles(auth.userId, auth.workspaceId)
			return app.getSortedFilteredFiles('shared', files)
		},
		[app]
	)
	if (!groups) throw Error('Files not found')

	return (
		<TlaWrapper>
			<div className="tla_content tla_page">
				<div className="tla_page__header">
					<h2 className="tla_text_ui__big">Groups</h2>
				</div>
				<TlaSpacer height={40} />
				<TlaPageControls viewName="shared" />
				<TlaSpacer height="20" />
			</div>
		</TlaWrapper>
	)
}
