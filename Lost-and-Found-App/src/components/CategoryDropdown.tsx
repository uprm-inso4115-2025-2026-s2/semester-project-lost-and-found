import React, { useState, useRef, useEffect } from 'react';
import './CategoryDropdown.css'; // Importing the CSS we will make in Step 2

// This tells TypeScript what props to expect
interface CategoryDropdownProps {
  onCategoryChange: (category: string) => void;
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({ onCategoryChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Category');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const categories = [
    'Most recent', 
    'All Categories', 
    'Electronic', 
    'Personal Item', 
    'School Supply'
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

  const handleSelect = (category: string) => {
    setSelectedCategory(category === 'All Categories' ? 'Category' : category);
    onCategoryChange(category);
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
          {categories.map((category, index) => (
            <React.Fragment key={category}>
              <li 
                className={`dropdown-item ${selectedCategory === category ? 'selected' : ''}`}
                onClick={() => handleSelect(category)}
              >
                {category}
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