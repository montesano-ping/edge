/*
 * Mixed 7 Block
 * Recreate Mixed 7
 * https://main--webdev-edge--pingidentity.aem.page/tools/sidekick/library.html?plugin=blocks&path=/tools/sidekick/blocks/mixed-7&index=0
 */

/* eslint-disable no-undef */
import { loadScript } from '../../scripts/aem.js';

export default async function decorate(block) {
  let image;
  [...block.children].forEach((row) => {
    // comes in as key-value pair, grab value
    const property = row.children[0].children[0].innerHTML;
    if (property === 'title') {
      const title = document.createElement('h1');
      title.innerHTML = row.children[1].children[0]?.innerHTML;
      row.replaceWith(title);
    }
    if (property === 'image') {
      image = row.children[1].children[0]?.querySelector('img');
      row.replaceWith('');
    }

    row.replaceWith(row.children[1]);
  });

  // content
  const content = document.createElement('div');
  content.setAttribute('class', 'content');
  content.innerHTML = block.innerHTML;

  const imageWrapper = document.createElement('div');
  imageWrapper.setAttribute('class', 'image-wrapper');
  imageWrapper.appendChild(image);

  const row = document.createElement('div');
  row.setAttribute('class', 'row');
  row.appendChild(content);
  row.appendChild(imageWrapper);

  // background graphics
  const bgGraphic1 = document.createElement('img');
  bgGraphic1.src = 'https://www.pingidentity.com/etc.clientlibs/settings/wcm/designs/pds/clientlibs/assets/clientlibs-assets-svgs/resources/backgrounds/Pattern-HI-Square-01-Alignment-Center-2.svg';
  bgGraphic1.setAttribute('class', 'bg-img-1');
  bgGraphic1.setAttribute('draggable', 'false');
  bgGraphic1.setAttribute('data-speed', '.80'); // parallax

  const bgGraphic2 = document.createElement('img');
  bgGraphic2.src = 'https://www.pingidentity.com/etc.clientlibs/settings/wcm/designs/pds/clientlibs/assets/clientlibs-assets-svgs/resources/backgrounds/Pattern-HI-Square-01-Alignment-Center.svg';
  bgGraphic2.setAttribute('class', 'bg-image-hi');
  bgGraphic2.setAttribute('draggable', 'false');
  bgGraphic2.setAttribute('data-speed', '.80'); // parallax

  const bgGraphicsContainer = document.createElement('div');
  bgGraphicsContainer.setAttribute('class', 'bg-graphics-container');
  bgGraphicsContainer.appendChild(bgGraphic1);
  bgGraphicsContainer.appendChild(bgGraphic2);

  block.innerHTML = '';
  block.appendChild(row);
  block.parentElement.appendChild(bgGraphicsContainer);

  // checks whether gsap is loaded
  // this is all general setup for parallax scrolling, so not necessary if already
  // done on another block
  if (false) { // turning off for UE testing
    await loadScript(`${window.hlx.codeBasePath}/scripts/vendors/gsap/gsap.min.js`, { async: true });
    await loadScript(`${window.hlx.codeBasePath}/scripts/vendors/gsap/ScrollTrigger.min.js`, { async: true });
    await loadScript(`${window.hlx.codeBasePath}/scripts/vendors/gsap/ScrollSmoother.min.js`, { async: true });

    gsap.registerPlugin(ScrollTrigger); // required for ScrollSmoother
    gsap.registerPlugin(ScrollSmoother);

    document.body.id = 'smooth-wrapper';
    document.querySelector('main').setAttribute('id', 'smooth-content');

    ScrollSmoother.create({
      smooth: 0,
      effects: true,
    });

    window.pdsEdge.gsapLoaded = true;
  } else if (window.pdsEdge.environment === 'local') {
    // eslint-disable-next-line no-console
    console.error('GSAP has already been loaded on this page, nothing to do.');
  }
}
