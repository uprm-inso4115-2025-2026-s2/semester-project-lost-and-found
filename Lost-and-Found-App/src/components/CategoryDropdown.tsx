import React, { useState, useRef, useEffect } from 'react';
import './CategoryDropdown.css'; // Importing the CSS we will make in Step 2
import type { Category } from '../ReportManagement/Reports';

export type CategoryFilter = Category | 'ALL';

// This tells TypeScript what props to expect
interface CategoryDropdownProps {
  onCategoryChange: (category: CategoryFilter) => void;
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({ onCategoryChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Category');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const categories: { label: string; value: CategoryFilter }[] = [
    { label: 'Most recent', value: 'ALL' },
    { label: 'Electronics',    value: 'ELECTRONICS' },
    { label: 'Personal',       value: 'PERSONAL' },
    { label: 'Office Supplies', value: 'OFFICE SUPPLIES' },
    { label: 'Other',          value: 'OTHER' },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: { label: string; value: CategoryFilter }) => {
    setSelectedCategory(option.value === 'ALL' ? 'Category' : option.label);
    onCategoryChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className="dropdown-container" ref={dropdownRef}>
      <button
        className="dropdown-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {selectedCategory}
        <span className="dropdown-arrow" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▼
        </span>
      </button>

      {isOpen && (
        <ul className="dropdown-menu">
          {categories.map((option, index) => (
            <React.Fragment key={option.value}>
              <li
                className={`dropdown-item ${selectedCategory === option.label ? 'selected' : ''}`}
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </li>
              {index === 0 && <hr className="dropdown-divider" />}
            </React.Fragment>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CategoryDropdown;