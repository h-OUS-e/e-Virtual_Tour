from flask import Flask, request, jsonify, send_from_directory, render_template
import csv
import os
import json

app = Flask(__name__)

# Define the directory and file for storing geometry parameters
CSV_DIRECTORY = os.path.join(app.root_path, 'static', '1_data')
CSV_FILE_PATH = os.path.join(CSV_DIRECTORY, "transition_nodes.csv")
# Ensure the directory exists
os.makedirs(CSV_DIRECTORY, exist_ok=True)

@app.route('/')
def home():
    return render_template('index.html') # this should be the landing page eventually

# Endpoint to add geometry parameters to CSV
@app.route('/add_geometry', methods=['POST'])
def add_geometry():
    data = request.json
    geometries = []
    # Check if the CSV file exists and if not, write the header
    file_exists = os.path.isfile(CSV_FILE_PATH)

    if (file_exists):
        with open(CSV_FILE_PATH, 'r', newline='', encoding='utf-8-sig') as csvfile:
            reader = csv.DictReader(csvfile)
            geometries = list(reader)


    # Check for duplicate ID
    for geometry in geometries:
        if geometry['Id'] == data['Id']:
            # Handle the duplicate ID (skip, update, or return an error)
            return jsonify({"success": False, "message": "Geometry with this ID already exists"})

    
    with open(CSV_FILE_PATH, 'a', newline='', encoding='utf-8-sig') as csvfile:
        fieldnames = ['Id', 'point', 'backgroundImgId', 'newBackgroundImgId']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        if not file_exists:
            writer.writeheader()  # Write header only once
        # No need to manually add a new line; DictWriter takes care of it
        writer.writerow({
            'Id': data['Id'],
            'point': data['point'],  # This should be the space-separated string
            'backgroundImgId': data['backgroundImgId'],
            'newBackgroundImgId': data['newBackgroundImgId']
        })
    return jsonify({"success": True, "message": "Geometry added"})

# Endpoint to get all geometries from CSV
@app.route('/get_geometries', methods=['GET'])
def get_geometries():
    geometries = []
    
    try:
        with open(CSV_FILE_PATH, mode='r', newline='', encoding='utf-8-sig') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                geometries.append(row)
                print(row)
    except FileNotFoundError:
        return jsonify({"success": False, "message": "File not found"})
    return jsonify(geometries)


@app.route('/delete_geometry', methods=['POST'])
def delete_geometry():
    data = request.json
    nodeId = data['Id']

    # Temporary list to store all entries except the one to delete
    updated_entries = []

    # Step 1: Read the existing CSV and filter out the entry to delete
    try:
        with open(CSV_FILE_PATH, mode='r', newline='', encoding='utf-8-sig') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                if row['Id'] != nodeId:  # Keep only entries that don't match the nodeId
                    updated_entries.append(row)
    except FileNotFoundError:
        return jsonify({"success": False, "message": "File not found"}), 404

    # Step 2: Rewrite the CSV without the deleted entry
    with open(CSV_FILE_PATH, mode='w', newline='', encoding='utf-8-sig') as csvfile:
        if updated_entries:  # Check if there are entries left to write
            fieldnames = updated_entries[0].keys()  # Get field names from the first entry
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(updated_entries)
        else:  # If no entries left, write just the header
            csvfile.write(','.join(['Id', 'point', 'backgroundImgId', 'newBackgroundImgId']) + '\n')

    return jsonify({"success": True, "message": "Geometry deleted"})


@app.route('/update_geometry', methods=['POST'])
def update_geometry():
    data = request.get_json()
    updated = False

    # Load existing data
    try:
        with open(CSV_FILE_PATH, 'r') as file:
            geometries = json.load(file)
    except FileNotFoundError:
        geometries = []

    # Update the matching node's data
    for node in geometries:
        if node['id'] == data['id']:
            node.update(data)  # Update node data with provided data
            updated = True
            break

    # If no matching node was found, optionally append the new data
    if not updated:
        geometries.append(data)

    # Save the updated data back to the file
    with open(CSV_FILE_PATH, 'w') as file:
        json.dump(geometries, file, indent=4)

    return jsonify({"success": True, "message": "Geometry updated"})


@app.route('/download_csv', methods=['GET'])
def download_csv():
    return send_from_directory(directory=CSV_DIRECTORY, filename="geometry_parameters.csv", as_attachment=True)


if __name__ == '__main__':
    app.run(debug=True)
