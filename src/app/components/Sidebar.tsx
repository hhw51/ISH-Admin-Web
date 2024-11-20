import React from 'react';
import { Box, List, ListItem, ListItemText, Typography } from '@mui/material';
import Link from 'next/link';

const Sidebar: React.FC = () => {
    return (
        <Box
            sx={{
                width: 250,
                bgcolor: '#2c3e50',
                color: 'white',
                padding: 2,
            }}
        >
            <Typography variant="h6">Sidebar Title</Typography>
            <List>
                <ListItem button>
                    <Link href="/" passHref>
                        <ListItemText primary="Link 1" sx={{ color: 'white' }} />
                    </Link>
                </ListItem>
                <ListItem button>
                    <Link href="/" passHref>
                        <ListItemText primary="Link 2" sx={{ color: 'white' }} />
                    </Link>
                </ListItem>
                <ListItem button>
                    <Link href="/" passHref>
                        <ListItemText primary="Link 3" sx={{ color: 'white' }} />
                    </Link>
                </ListItem>
                <ListItem button>
                    <Link href="/" passHref>
                        <ListItemText primary="Link 4" sx={{ color: 'white' }} />
                    </Link>
                </ListItem>
            </List>
        </Box>
    );
};

export default Sidebar;