

'use client';

import { useState, useEffect } from 'react';
import { firestore } from './firebase';
import { Box, Typography, Modal, Stack, TextField, Button } from '@mui/material';
import { collection, query, getDocs, getDoc, deleteDoc, doc, setDoc } from "firebase/firestore";

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [filteredPantry, setFilteredPantry] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(1);
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
    if (!item) return;

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

  const updateItemQuantity = async (item, newQuantity) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
    if (newQuantity <= 0) {
      await deleteDoc(docRef);
    } else {
      await setDoc(docRef, { quantity: newQuantity });
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
  const handleClose = () => {
    setItemName('');
    setQuantity(1);
    setOpen(false);
  };

  const handleSave = () => {
    addItem(itemName, quantity);
    handleClose();
  };

  const adjustQuantity = (item, adjustment) => {
    const currentItem = pantry.find(p => p.name === item);
    if (currentItem) {
      const newQuantity = currentItem.quantity + adjustment;
      updateItemQuantity(item, newQuantity);
    }
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#FFF',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='10' x='10' font-size='10' fill='%23FFB74D'%3E🍎🍏🍋🍉🍇🍈🍊🍍🥭🥥🍒🍓🍑🍆🥑🥝🥥🥑🍅🥒🥬🧅🧄🧅%3C/text%3E%3C/svg%3E")`,
        backgroundSize: '8rem 8rem',
        backgroundRepeat: 'repeat',
        backgroundPosition: 'top left',
        zIndex: 10,
        fontFamily: "'Courier New', monospace",
        border: '10px solid #FFB74D' // Add border to all 4 sides
      }}
    >
      <Box
        width="100%"
        maxWidth="1200px"
        height="100%"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        bgcolor="#FFF"
        borderRadius={4}
        boxShadow={3}
        p={4}
        sx={{ position: 'relative', zIndex: 1, fontFamily: "'Courier New', monospace" }}
      >
        <Box display="flex" flexDirection="column" alignItems="center" textAlign="center" mb={4}>
          <Typography
            variant="h4"
            p={2}
            bgcolor="#FFF"
            color="#000"
            borderRadius={2}
            sx={{ fontFamily: "'Courier New', monospace" }}
          >
            Pantry Tracker!🛒
          </Typography>
          <Stack direction="row" spacing={2} mt={2}>
            <TextField
              variant="outlined"
              placeholder="Search pantry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ width: 200, bgcolor: '#FFF', color: '#000', borderRadius: 1, border: '1px solid #FFB74D', fontFamily: "'Courier New', monospace" }}
            />
            <Button
              variant="contained"
              onClick={handleOpen}
              sx={{ bgcolor: "#FFB74D", color: "#FFF", borderRadius: '50%', width: 56, height: 56, minWidth: 0, fontFamily: "'Courier New', monospace" }}
            >
              +
            </Button>
          </Stack>
        </Box>

        <Modal open={open} onClose={handleClose}>
          <Box
            position="absolute"
            top="50%"
            left="50%"
            width={400}
            bgcolor="#FFF"
            border="2px solid #FFB74D"
            boxShadow={24}
            p={4}
            display="flex"
            flexDirection="column"
            gap={3}
            sx={{ transform: "translate(-50%,-50%)", borderRadius: 2, fontFamily: "'Courier New', monospace" }}
          >
            <Typography variant="h6" color="#000">Add Item</Typography>
            <TextField
              label="Item Name"
              variant="outlined"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              sx={{ fontFamily: "'Courier New', monospace" }}
            />
            <TextField
              label="Quantity"
              type="number"
              variant="outlined"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              sx={{ fontFamily: "'Courier New', monospace" }}
            />
            <Button
              variant="contained"
              onClick={handleSave}
              sx={{ bgcolor: "#FFB74D", color: "#FFF", fontFamily: "'Courier New', monospace" }}
            >
              Save
            </Button>
          </Box>
        </Modal>

        <Box
          border="1px solid #FFB74D"
          p={2}
          display="flex"
          flexDirection="column"
          alignItems="center"
          mt={2}
          width="100%"
          maxWidth="800px"
          sx={{ fontFamily: "'Courier New', monospace" }}
        >
          <Stack width="100%" height="400px" spacing={2} overflow="auto" sx={{ fontFamily: "'Courier New', monospace" }}>
            {filteredPantry.map(({ name, quantity }) => (
              <Box
                key={name}
                width="100%"
                minHeight="100px"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                bgcolor="#FFF"
                color="#000"
                border="2px solid #FFB74D"
                padding={2}
                borderRadius={2}
                sx={{ fontFamily: "'Courier New', monospace" }}
              >
                <Typography variant="h6" textAlign="center" flexGrow={1} sx={{ fontFamily: "'Courier New', monospace" }}>
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ fontFamily: "'Courier New', monospace" }}>
                  <Button
                    variant="outlined"
                    onClick={() => adjustQuantity(name, -1)}
                    sx={{ bgcolor: "#FFB74D", color: "#FFF", borderRadius: '50%', width: 40, height: 40, minWidth: 0, fontFamily: "'Courier New', monospace" }}
                  >
                    -
                  </Button>
                  <Typography variant="h6" textAlign="center" sx={{ fontFamily: "'Courier New', monospace" }}>
                    {quantity}
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => adjustQuantity(name, 1)}
                    sx={{ bgcolor: "#FFB74D", color: "#FFF", borderRadius: '50%', width: 40, height: 40, minWidth: 0, fontFamily: "'Courier New', monospace" }}
                  >
                    +
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => updateItemQuantity(name, 0)}
                    sx={{ bgcolor: "#FFB74D", color: "#FFF", borderRadius: 1, fontFamily: "'Courier New', monospace" }}
                  >
                    Remove
                  </Button>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

