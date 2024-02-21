// A script to load json data files


async function loadMediaPlayerTypes() {
    try {
        const response = await fetch('../static/js/mediaPlayerTypes.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data; // This returns the parsed JSON data
    } catch (error) {
        console.error('Error fetching the JSON:', error);
        return null; // Handle the error as appropriate for your application
    }
}


export { loadMediaPlayerTypes };

