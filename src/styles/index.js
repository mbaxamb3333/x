/* eslint-disable */

const styles = [
  {
    type: 'href',
    body: '/css/normalize.css',
  },
  {
    type: 'href',
    body: '/css/webflow.css',
  },
  {
    type: 'href',
    body: '/css/the-nftist-570236cba5e431-fe7c05599833c.webflow.css',
  },
  {
    type: 'sheet',
    body: '.af-view .af-class-image-2{background-color:rgba(0,0,0,.6);border-radius:10px}.af-view .af-class-Sticky_Header{position:fixed;top:0;width:100%;z-index:9;left:0;right:0;margin-top:0;padding:6px 32px}.af-view .af-class-Sticky_Header a.af-class-brand.w-nav-brand img{width:82px}.af-view .af-class-dropdown-toggle.w--open .af-class-icon.w-icon-dropdown-toggle{transform:rotate(-180deg);transition:all ease-in-out .3s}.af-view .af-class-Sticky_Header a.af-class-menuuss.af-class-mint-now{padding-top:23px;padding-bottom:22px;font-size:15px}.af-view .af-class-Sticky_Header a.af-class-menuuss{font-size:19px}.af-view .af-class-dropdown-toggle.w--open .af-class-text-block.af-class-drpodowwnnw{color:#000;font-size:91.86px}@media screen and (max-width:600px){.af-view{max-width:100%;overflow-x:hidden!important}.af-view #demo{font-size:148px!important}.af-view .af-class-dropdown-toggle.w--open .af-class-text-block.af-class-drpodowwnnw{color:#000;font-size:24px}.af-view .af-class-Sticky_Header{position:unset}.af-view .af-class-dropdown-toggle.w--open .af-class-text-block.af-class-drpodowwnnw{color:#000}}',
  },
]

const loadingStyles = styles.map((style) => {
  let styleEl
  let loading

  if (style.type == 'href') {
    styleEl = document.createElement('link')

    loading = new Promise((resolve, reject) => {
      styleEl.onload = resolve
      styleEl.onerror = reject
    })

    styleEl.rel = 'stylesheet'
    styleEl.type = 'text/css'
    styleEl.href = style.body
  }
  else {
    styleEl = document.createElement('style')
    styleEl.type = 'text/css'
    styleEl.innerHTML = style.body

    loading = Promise.resolve()
  }

  document.head.appendChild(styleEl)

  return loading
})

export default Promise.all(loadingStyles).then(() => {
  const styleSheets = Array.from(document.styleSheets).filter((styleSheet) => {
    return styleSheet.href && styles.some((style) => {
      return style.type == 'href' && styleSheet.href.match(style.body)
    })
  })
  styleSheets.forEach((styleSheet) => {
    Array.from(styleSheet.rules).forEach((rule) => {
      if (rule.selectorText) {
        rule.selectorText = rule.selectorText
          .replace(/\.([\w_-]+)/g, '.af-class-$1')
          .replace(/\[class(.?)="( ?)([^"]+)( ?)"\]/g, '[class$1="$2af-class-$3$4"]')
          .replace(/([^\s][^,]*)(\s*,?)/g, '.af-view $1$2')
          .replace(/\.af-view html/g, '.af-view')
          .replace(/\.af-view body/g, '.af-view')
          .replace(/af-class-w-/g, 'w-')
          .replace(/af-class-anima-/g, 'anima-')
          .replace(/af-class-([\w_-]+)an-animation([\w_-]+)/g, '$1an-animation$2')
      }
    })
  })
})

/* eslint-enable */