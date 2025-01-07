import React, { useState } from "react";
import { TextField, MenuItem, Box, ListSubheader } from "@mui/material";
import { FixedSizeList } from "react-window";

const FilterableSelect = ({ value, onChange, options, idField, displayField }) => {
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState(false);

  // Filter options based on search input
  const filteredOptions = options.filter((option) =>
    option[displayField].toLowerCase().includes(filter.toLowerCase())
  );

  const selectedOption = options.find((option) => option[idField] === value);
  const selectedDisplayValue = selectedOption ? selectedOption[displayField] : "";

  const handleSelect = (optionId) => {
    onChange(optionId); // Trigger onChange with the selected option ID
    setOpen(false); // Close the dropdown after selection
  };

  const handleClose = () => {
    setOpen(false); // Close dropdown
    setFilter(""); // Clear filter only when dropdown is fully closed
  };

  const renderRow = ({ index, style }) => {
    const option = filteredOptions[index];
    return (
      <MenuItem
        key={option[idField]}
        value={option[idField]}
        onClick={() => handleSelect(option[idField])} // Handle option selection
        style={style} // Apply virtualization styles
      >
        {option[displayField]}
      </MenuItem>
    );
  };

  return (
    <TextField
      select
      fullWidth
      value={selectedDisplayValue || ""}
      onChange={(e) => onChange(e.target.value)}
      SelectProps={{
        open: open, // Control the open state of the dropdown
        onClose: handleClose,
        onOpen: () => setOpen(true),
        renderValue: (selected) =>
            selectedDisplayValue || <span style={{ color: "#aaa" }}>Select an option</span>,
        MenuProps: {
          PaperProps: {
            style: {
              maxHeight: 300, // Limit dropdown height
              overflow: "hidden", // Hide unnecessary scrollbars
              width: '500px',
            },
          },
        },
      }}
    >
      {/* Sticky Search Field */}
      <ListSubheader style={{ backgroundColor: "white", zIndex: 1 }}>
        <Box
          sx={{
            padding: "8px",
            borderBottom: "1px solid #ddd",
          }}
        >
          <TextField
            placeholder="Search..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            variant="standard"
            fullWidth
            onClick={(e) => e.stopPropagation()} // Prevent dropdown from closing
            onKeyDown={(e) => e.stopPropagation()} // Prevent native behavior
          />
        </Box>
      </ListSubheader>

      {/* Virtualized Options */}
      {filteredOptions.length > 0 ? (
        <FixedSizeList
          height={200} // Height of the dropdown
          itemCount={filteredOptions.length}
          itemSize={36} // Height of each row
          width="100%"
        >
          {renderRow}
        </FixedSizeList>
      ) : (
        <MenuItem disabled>No results found</MenuItem>
      )}
    </TextField>
  );
};

export default FilterableSelect;