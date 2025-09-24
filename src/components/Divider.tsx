import React, { type ReactNode } from 'react';
import './Divider.css';

interface DividerProps {
  /** Ориентация разделителя */
  orientation?: 'horizontal' | 'vertical';
  /** Размер разделителя */
  size?: 'small' | 'medium' | 'large';
  /** Стиль разделителя */
  variant?: 'solid' | 'dashed' | 'dotted' | 'gradient';
  /** Цвет разделителя */
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  /** Текст или элемент в центре */
  children?: ReactNode;
  /** Позиция содержимого */
  position?: 'center' | 'left' | 'right';
  /** Дополнительные классы */
  className?: string;
  /** Отступы */
  spacing?: 'none' | 'small' | 'medium' | 'large';
  /** Иконка в центре (вместо children) */
  icon?: ReactNode;
}

const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  size = 'medium',
  variant = 'solid',
  color = 'default',
  children,
  position = 'center',
  className = '',
  spacing = 'medium',
  icon
}) => {
  const hasContent = !!children || !!icon;

  return (
    <div
      className={`divider ${className}`}
      data-orientation={orientation}
      data-size={size}
      data-variant={variant}
      data-color={color}
      data-position={position}
      data-spacing={spacing}
      data-has-content={hasContent}
      role="separator"
    >
      {hasContent ? (
        <>
          <div className="divider-line divider-line-before" />
          <div className="divider-content">
            {icon ? (
              <div className="divider-icon">
                {icon}
              </div>
            ) : (
              children
            )}
          </div>
          <div className="divider-line divider-line-after" />
        </>
      ) : (
        <div className="divider-line" />
      )}
    </div>
  );
};

export default Divider;
