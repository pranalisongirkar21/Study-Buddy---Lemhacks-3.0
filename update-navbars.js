const fs = require('fs');
const path = require('path');

// Get all HTML files in the directory
const htmlFiles = fs.readdirSync('.').filter(file => file.endsWith('.html'));

htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Check if file has a navbar
    if (content.includes('class="navbar"')) {
        // Add Font Awesome if not present
        if (!content.includes('font-awesome')) {
            content = content.replace('</head>',
                '    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">\n</head>'
            );
        }
        
        // Add user-profile.js if not present
        if (!content.includes('user-profile.js')) {
            content = content.replace('</body>',
                '    <script src="user-profile.js"></script>\n</body>'
            );
        }
        
        // Write the updated content back to the file
        fs.writeFileSync(file, content);
        console.log(`Updated ${file}`);
    }
}); 