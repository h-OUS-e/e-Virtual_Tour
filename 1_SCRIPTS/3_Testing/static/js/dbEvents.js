function emitGETProjectDataEvent(project_id) {
    const event = new CustomEvent('GET-project-data', { detail: { project_id } });
    document.dispatchEvent(event);
}
