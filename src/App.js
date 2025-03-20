// Add a style element to control Bootstrap Icons sizing
const iconStyle = document.createElement('style');
iconStyle.innerHTML = `
  i.bi {
    font-size: inherit !important;
    width: 1em !important;
    height: 1em !important;
    vertical-align: -0.125em !important;
    display: inline-block !important;
    overflow: visible !important;
    flex-shrink: 0 !important;
    max-width: none !important;
  }
  
  button i.bi, a i.bi, .icon-container i.bi {
    font-size: 1rem !important;
  }
`;
document.head.appendChild(iconStyle); 