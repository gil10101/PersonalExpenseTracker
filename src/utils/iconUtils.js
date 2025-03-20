/**
 * Icon utility functions for consistent sizing across the application
 */

/**
 * Returns the appropriate class for the icon size
 * @param {string} size - The size of the icon (xs, sm, md, lg, xl)
 * @returns {string} - The CSS class for the icon size
 */
export const getIconSizeClass = (size = 'sm') => {
  const sizes = {
    xs: 'tabler-icon-xs',
    sm: 'tabler-icon-sm',
    md: 'tabler-icon-md',
    lg: 'tabler-icon-lg',
    xl: 'tabler-icon-xl'
  };
  
  return sizes[size] || sizes.sm;
};

/**
 * Helper function to combine icon classes with additional classes
 * @param {string} size - The size of the icon (xs, sm, md, lg, xl)
 * @param {string} extraClasses - Additional CSS classes to add
 * @returns {string} - Combined CSS classes
 */
export const iconClass = (size = 'sm', extraClasses = '') => {
  return `tabler-icon ${getIconSizeClass(size)} ${extraClasses}`.trim();
};

/**
 * Standard sizes in pixels mapped to our size variables
 */
export const ICON_SIZES = {
  xs: '12px', // 0.75rem
  sm: '16px', // 1rem
  md: '20px', // 1.25rem
  lg: '24px', // 1.5rem
  xl: '32px', // 2rem
};

/**
 * Icon props for Tabler Icons
 * @param {string} size - The size of the icon (xs, sm, md, lg, xl)
 * @param {string} color - The color of the icon (default: currentColor)
 * @param {number} stroke - The stroke width (default: 2)
 * @returns {object} - Props object for Tabler Icons
 */
export const tablerIconProps = (size = 'sm', color = 'currentColor', stroke = 2) => {
  const sizeInPx = {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32
  };
  
  return {
    size: sizeInPx[size] || sizeInPx.sm,
    color,
    stroke
  };
};

/**
 * Icon props to spread into icon components
 * @param {string} size - The size of the icon (xs, sm, md, lg, xl)
 * @returns {object} - Props object with className
 */
export const iconProps = (size = 'sm') => ({
  className: `tabler-icon ${getIconSizeClass(size)}`
});

/**
 * Create style object for inline styling of icons
 * @param {string} size - The size of the icon (xs, sm, md, lg, xl) 
 * @returns {object} - Style object with width and height
 */
export const iconStyle = (size = 'sm') => ({
  width: ICON_SIZES[size] || ICON_SIZES.sm,
  height: ICON_SIZES[size] || ICON_SIZES.sm,
});

export default {
  getIconSizeClass,
  iconClass,
  iconProps,
  tablerIconProps,
  iconStyle,
  ICON_SIZES
}; 