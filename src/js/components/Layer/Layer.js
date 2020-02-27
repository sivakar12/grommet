import React, { forwardRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';

import { getNewContainer } from '../../utils';

import { LayerContainer } from './LayerContainer';
import { animationDuration } from './StyledLayer';

const Layer = forwardRef((props, ref) => {
  const { animate, animation } = props;
  const originalFocusedElement = useMemo(() => document.activeElement, []);
  const layerContainer = useMemo(() => getNewContainer(), []);

  // just a few things to clean up when the Layer is unmounted
  useEffect(
    () => () => {
      if (originalFocusedElement) {
        if (originalFocusedElement.focus) {
          // wait for the fixed positioning to come back to normal
          // see layer styling for reference
          setTimeout(() => originalFocusedElement.focus(), 0);
        } else if (
          originalFocusedElement.parentNode &&
          originalFocusedElement.parentNode.focus
        ) {
          // required for IE11 and Edge
          originalFocusedElement.parentNode.focus();
        }
      }

      const activeAnimation = animation !== undefined ? animation : animate;
      if (activeAnimation !== false) {
        // undefined uses 'slide' as the default
        // animate out and remove later
        const layerClone = layerContainer.cloneNode(true);
        layerClone.id = 'layerClone';
        document.body.appendChild(layerClone);
        const clonedContainer = layerClone.querySelector(
          '[class*="StyledLayer__StyledContainer"]',
        );
        if (clonedContainer && clonedContainer.style) {
          clonedContainer.style.animationDirection = 'reverse';
        }
        setTimeout(() => {
          // we add the id and query here so the unit tests work
          const clone = document.getElementById('layerClone');
          if (clone) {
            document.body.removeChild(clone);
            layerContainer.remove();
          }
        }, animationDuration);
      } else {
        document.body.removeChild(layerContainer);
      }
    },
    [animate, animation, layerContainer, originalFocusedElement],
  );

  return layerContainer
    ? createPortal(<LayerContainer ref={ref} {...props} />, layerContainer)
    : null;
});

Layer.displayName = 'Layer';

let LayerDoc;
if (process.env.NODE_ENV !== 'production') {
  LayerDoc = require('./doc').doc(Layer); // eslint-disable-line global-require
}
const LayerWrapper = LayerDoc || Layer;

export { LayerWrapper as Layer };
