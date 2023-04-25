import * as customComponents from '../article-components'
import * as apiComponents from './api-docs'
import {
	A,
	Blockquote,
	Divider,
	Heading1,
	Heading2,
	Heading3,
	Heading4,
	Heading5,
	Heading6,
	Image,
	ListItem,
	OrderedList,
	Paragraph,
	Small,
	Table,
	TD,
	THead,
	TR,
	UnorderedList,
	Video,
} from './generic'

export const scope = {}

export const components = {
	h1: Heading1,
	h2: Heading2,
	h3: Heading3,
	h4: Heading4,
	h5: Heading5,
	h6: Heading6,
	blockquote: Blockquote,
	hr: Divider,
	a: A,
	p: Paragraph,
	table: Table,
	thead: THead,
	tr: TR,
	td: TD,
	video: Video,
	ol: OrderedList,
	ul: UnorderedList,
	li: ListItem,
	img: Image,
	Small: Small,
	...customComponents,
	...apiComponents,
}
