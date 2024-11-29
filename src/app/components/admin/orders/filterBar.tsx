"use client"
import React from "react";
import { TextField, Box } from "@mui/material";

interface FilterBarProps {
  search: string;
  setSearch: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ search, setSearch, category, setCategory }) => {
  return (
    <Box sx={{ display: "flex", gap: 2, marginBottom: 2 }}>
      <TextField
        label="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        fullWidth
      />
      <TextField
        label="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        fullWidth
      />
    </Box>
  );
};

export default FilterBar;
