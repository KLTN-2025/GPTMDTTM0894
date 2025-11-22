import { useState, useRef } from "react";
import { Dropdown, DropdownButton, Form } from "react-bootstrap";

export default function ProductFilter({ name = "" }) {
  const [sortBy, setSortBy] = useState("featured");

  const [selectedFilters, setSelectedFilters] = useState({});
  const dropdownRefs = useRef({}); // Refs từng dropdown

  const filters = [
    {
      label: "Mức giá",
      options: ["Dưới 10 triệu", "10-20 triệu", "Trên 20 triệu"],
    },
    {
      label: "Hỗ trợ 5G",
      options: ["Có", "Không"],
    },
    {
      label: "Dung lượng lưu trữ",
      options: ["64GB", "128GB", "256GB", "512GB"],
    },
    {
      label: "NFC",
      options: ["Có", "Không"],
    },
    {
      label: "Màn hình",
      options: ["OLED", "LCD", "120Hz", "60Hz"],
    },
  ];

  const handleToggle = (label) => {
    // Khi mở dropdown, cuộn xuống cho nó hiển thị đẹp
    const el = dropdownRefs.current[label];
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 200);
    }
  };

  const handleCheckboxChange = (filterLabel, option) => {
    setSelectedFilters((prev) => {
      const currentOptions = prev[filterLabel] || [];
      const isSelected = currentOptions.includes(option);
      const updatedOptions = isSelected
        ? currentOptions.filter((o) => o !== option)
        : [...currentOptions, option];

      return {
        ...prev,
        [filterLabel]: updatedOptions,
      };
    });
  };

  return (
    
      <div className="container py-3" style={{ maxWidth: 1520 }}>
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div className="d-flex flex-wrap gap-2">
            {filters.map((filter) => (
              <div
                key={filter.label}
                ref={(el) => (dropdownRefs.current[filter.label] = el)}
              >
                <DropdownButton
                  drop="down"
                  title={filter.label}
                  variant="outline-secondary"
                  className="rounded-pill"
                  style={{ minWidth: 50 }}
                  onToggle={(isOpen) => isOpen && handleToggle(filter.label)}
                >
                  <div className="px-3 py-2">
                    {filter.options.map((option) => (
                      <Form.Check
                        key={option}
                        type="checkbox"
                        label={option}
                        checked={
                          selectedFilters[filter.label]?.includes(option) || false
                        }
                        onChange={() =>
                          handleCheckboxChange(filter.label, option)
                        }
                      />
                    ))}
                  </div>
                </DropdownButton>
              </div>
            ))}
          </div>
            <select
              className="form-select w-auto"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="featured">Nổi bật</option>
              <option value="price_asc">Giá thấp đến cao</option>
              <option value="price_desc">Giá cao đến thấp</option>
              <option value="newest">Mới nhất</option>
            </select>
          </div>
     </div>
  );
}
