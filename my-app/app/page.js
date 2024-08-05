'use client';

import { useState, useEffect } from 'react';
import { firestore } from './firebase';
import { Box, Typography, Modal, Stack, TextField, Button, Select, MenuItem } from '@mui/material';
import { collection, query, getDocs, getDoc, deleteDoc, doc, setDoc } from "firebase/firestore";

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [filteredPantry, setFilteredPantry] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const updatePantry = async () => {
    const snapshot = query(collection(firestore, 'pantry'));
    const docs = await getDocs(snapshot);
    const pantryList = [];
    docs.forEach((doc) => {
      pantryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setPantry(pantryList);
    setFilteredPantry(pantryList);
  };

  const addItem = async (item) => {
    if (!item) return; // Prevent empty item names

    const docRef = doc(collection(firestore, 'pantry'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }

    await updatePantry();
  };

  const updateItemQuantity = async (item, quantity) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
    if (quantity === "REMOVE" || quantity === 0) {
      await deleteDoc(docRef);
    } else {
      await setDoc(docRef, { quantity });
    }
    await updatePantry();
  };

  useEffect(() => {
    updatePantry();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setFilteredPantry(pantry.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())));
    } else {
      setFilteredPantry(pantry);
    }
  }, [searchQuery, pantry]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box width="100vw" height="100vh" display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap={2} bgcolor="#FFC0CB">
      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="#8B4513" // Brown background for the modal
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{ transform: "translate(-50%,-50%)" }}
        >
          <Typography variant="h6" color="#FFF">Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName);
                setItemName('');
                handleClose();
              }}
              sx={{ bgcolor: "#8B4513", color: "#FFF" }} // Brown background for the button
            >
              ADD
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Box width="100%" display="flex" justifyContent="flex-end" p={2} position="relative" bgcolor="#FFC0CB">
        <TextField
          variant="outlined"
          placeholder="Search pantry..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: 200, bgcolor: '#fff' }} // Shorter search bar
        />
      </Box>
      <Button variant="contained" onClick={handleOpen} sx={{ bgcolor: "#8B4513", color: "#FFF", mb: 2 }}>
          Add New Item
        </Button>
      <Box border="1px solid #333" p={2} display="flex" flexDirection="column" alignItems="center">
        <Box width="800px" height="100px" bgcolor="#8B4513" display="flex" justifyContent="center" alignItems="center" p={2}>
          <Typography variant="h4" color="#FFF" textAlign="center" noWrap>
            PANTRY MANAGEMENT APP
          </Typography>
        </Box>
        <Stack width="300px" height="300px" spacing={2} overflow="auto" alignItems="center">
          {filteredPantry.map(({ name, quantity }) => (
            <Box
              key={name}
              width="100%"
              minHeight="150px"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              bgcolor="#f0f0f0"
              padding={5}
            >
              <Typography variant="h6" color="#333" textAlign="center">
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Select
                value={quantity}
                onChange={(e) => updateItemQuantity(name, e.target.value)}
                displayEmpty
                sx={{ minWidth: 60 }}
              >
                {[...Array(10).keys()].map((num) => (
                  <MenuItem key={num} value={num}>{num}</MenuItem>
                ))}
                <MenuItem value={"REMOVE"}>Remove</MenuItem>
              </Select>
              <Stack direction="row" spacing={2}>
                <Button variant="contained" onClick={() => addItem(name)} sx={{ bgcolor: "#8B4513", color: "#FFF" }}>
                  ADD
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}