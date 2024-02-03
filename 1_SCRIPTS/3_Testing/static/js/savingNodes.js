const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Route to handle saving node data
app.post('/save-node', (req, res) => {
    const nodeData = req.body; // Get node data from request body
    const filePath = 'path/to/nodes.json'; // Define the JSON file path

    // Read the existing nodes JSON file
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading nodes file');
        }

        // Parse existing nodes data and add the new node
        let nodes = JSON.parse(data.toString() || '[]');
        nodes.push(nodeData);

        // Write the updated nodes data back to the file
        fs.writeFile(filePath, JSON.stringify(nodes, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error saving node');
            }
            res.send('Node saved successfully');
        });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});