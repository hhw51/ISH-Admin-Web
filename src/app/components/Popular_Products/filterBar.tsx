"use client"
import React from "react";
import { TextField, Select, MenuItem } from "@mui/material";

interface FilterBarProps {
  search: string;
  setSearch: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ search, setSearch, category, setCategory }) => {
  return (
    <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
      <TextField
        label="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        fullWidth
      />
      <Select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        displayEmpty
      >
        <MenuItem value="">All Categories</MenuItem>
        <MenuItem value="Electronics">Electronics</MenuItem>
        <MenuItem value="Books">Books</MenuItem>
        <MenuItem value="Fashion">Fashion</MenuItem>
      </Select>
    </div>
  );
};

export default FilterBar;
