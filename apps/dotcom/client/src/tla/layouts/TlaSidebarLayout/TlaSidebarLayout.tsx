import { ReactNode } from 'react'
import { useValue } from 'tldraw'
import { globalEditor } from '../../../utils/globalEditor'
import { TlaSidebar } from '../../components/TlaSidebar/TlaSidebar'
import { useApp } from '../../hooks/useAppState'
import { usePreventAccidentalDrops } from '../../hooks/usePreventAccidentalDrops'
import styles from './sidebar-layout.module.css'

export function TlaSidebarLayout({ children }: { children: ReactNode; collapsable?: boolean }) {
	const app = useApp()
	const isSidebarOpen = useValue('sidebar open', () => app.getSessionState().isSidebarOpen, [app])
	const isSidebarOpenMobile = useValue(
		'sidebar open mobile',
		() => app.getSessionState().isSidebarOpenMobile,
		[app]
	)
	const currentEditor = useValue('editor', () => globalEditor.get(), [])
	usePreventAccidentalDrops()

	return (
		<div
			className={styles.layout}
			data-sidebar={isSidebarOpen}
			data-sidebarmobile={isSidebarOpenMobile}
		>
			{currentEditor && <TlaSidebar />}
			{children}
		</div>
	)
}
