import { hydrate, mount } from 'svelte'
import Site from './Site.svelte'
import '../design/tokens.css'
import './site.css'

const target = document.getElementById('app')!
const props = { initialPath: window.location.pathname }
if (target.hasChildNodes()) hydrate(Site, { target, props })
else mount(Site, { target, props })
