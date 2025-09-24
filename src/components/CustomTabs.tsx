import React, { type ReactNode } from 'react';
import './CustomTabs.css';

export interface TabItem {
  value: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

interface CustomTabsProps {
  items: TabItem[];
  activeTab: string;
  onTabChange: (value: string) => void;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'pills' | 'underline';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  className?: string;
  fullWidth?: boolean;
}

const CustomTabs: React.FC<CustomTabsProps> = ({
  items,
  activeTab,
  onTabChange,
  size = 'medium',
  variant = 'default',
  color = 'primary',
  className = '',
  fullWidth = true
}) => {
  const handleTabClick = (value: string, disabled?: boolean) => {
    if (!disabled) {
      onTabChange(value);
    }
  };

  return (
    <div 
      className={`custom-tabs ${className}`}
      data-size={size}
      data-variant={variant}
      data-color={color}
      data-full-width={fullWidth}
    >
      <div className="custom-tabs-list gap-2 p-1 rounded-lg">
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            className={`custom-tab-trigger rounded-full ${
              activeTab === item.value ? 'active' : ''
            } ${item.disabled ? 'disabled' : ''}`}
            onClick={() => handleTabClick(item.value, item.disabled)}
            disabled={item.disabled}
            data-value={item.value}
          >
            {/* {item.icon && (
              <span className="tab-icon">
                {item.icon}
              </span>
            )} */}
            <span className="tab-label">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CustomTabs;
