from flask import Flask, request, jsonify, send_from_directory, render_template
import csv
import os
import json

app = Flask(__name__)

# Define the directory and file for storing geometry parameters
CSV_DIRECTORY = os.path.join(app.root_path, 'static', '1_data')
object_attribute_mapping = {
    'TransitionNode': ['Id', 'point', 'backgroundImgId', 'newBackgroundImgId'],
    'MediaPlayer': ['Id', 'url', 'volume', 'looping']
}
# CSV_FILE_PATH = os.path.join(CSV_DIRECTORY, "transition_nodes.csv")
# Ensure the directory exists
os.makedirs(CSV_DIRECTORY, exist_ok=True)



@app.route('/static/js/<path:filename>')
def custom_static_js(filename):
    """
    Serve JavaScript files with the correct MIME type.
    """
    return send_from_directory(os.path.join(app.root_path, 'static', 'js'), filename, mimetype='text/javascript')


@app.route('/')
def home():
    return render_template('index.html') # this should be the landing page eventually


# Endpoint to add geometry parameters to CSV
@app.route('/add_geometry', methods=['POST'])
def add_geometry():
    data = request.json
    geometries = []
    print(data)

    # Getting requested object type to add
    fieldnames = object_attribute_mapping[data['objectType']]
    if not fieldnames:
        # If objectType is not recognized or fieldnames are not defined
        return jsonify({"success": False, "message": "Invalid or missing objectType"}), 400
    
    # Check if the CSV file exists and if not, write the header
    CSV_FILE_PATH = os.path.join(CSV_DIRECTORY, f"{data['objectType']}.csv")
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

    # Write object into the CSV file
    with open(CSV_FILE_PATH, 'a', newline='', encoding='utf-8-sig') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        if not file_exists:
            writer.writeheader()  # Write header only once

        # Prepare row data based on dynamic fieldnames
        row_data = {fieldname: data[fieldname] for fieldname in fieldnames}
        writer.writerow(row_data)

    return jsonify({"success": True, "message": "Geometry added"})


# Endpoint to get all geometries from CSV
@app.route('/get_geometries', methods=['GET'])
def get_geometries():
    object_type = request.args.get('objectType')  # Get objectType from query parameters
    if object_type not in object_attribute_mapping.keys():
        return jsonify({"success": False, "message": "Invalid object type"}), 404
    print("TEST", object_type)
    geometries = []
    CSV_FILE_PATH = os.path.join(CSV_DIRECTORY, f"{object_type}.csv")

    try:
        with open(CSV_FILE_PATH, mode='r', newline='', encoding='utf-8-sig') as csvfile:
            reader = csv.DictReader(csvfile)
            geometries = [row for row in reader]            
    except FileNotFoundError:
        return jsonify({"success": False, "message": "File not found"}), 404
    
    return jsonify(geometries)


@app.route('/delete_geometry', methods=['POST'])
def delete_geometry():
    data = request.json
    nodeId = data['Id']
    CSV_FILE_PATH = os.path.join(CSV_DIRECTORY, f"{data['objectType']}.csv")


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
            if data['objectType'] not in object_attribute_mapping:                
                return jsonify({"success": False, "message": "Invalid object type"}), 400
            
            csvfile.write(','.join(object_attribute_mapping[data['objectType']]) + '\n')

    return jsonify({"success": True, "message": "Geometry deleted"})


@app.route('/update_geometry', methods=['POST'])
def update_geometry():
    data = request.json
    print(data)
    nodeId = data['Id']
    # Getting requested object type to add
    fieldnames = object_attribute_mapping[data['objectType']]
    CSV_FILE_PATH = os.path.join(CSV_DIRECTORY, f"{data['objectType']}.csv")
    

    # Load existing data
    try:
        with open(CSV_FILE_PATH, 'r', newline='', encoding='utf-8-sig') as csvfile:
            reader = csv.DictReader(csvfile)
            geometries = list(reader)
    except FileNotFoundError:
        return jsonify({"success": False, "message": "File not found"}), 404

    # Update the matching node's data
    updated = False
    for geometry in geometries:
        if geometry['Id'] == nodeId:
            for fieldname in fieldnames:
                geometry[fieldname] = data.get(fieldname, geometry[fieldname])
            updated = True
            break

    if not updated:
        return jsonify({"success": False, "message": "Geometry not found"}), 404

    # Write all data back to the CSV file
    with open(CSV_FILE_PATH, 'w', newline='', encoding='utf-8-sig') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(geometries)

    return jsonify({"success": True, "message": "Geometry updated"})

@app.route('/download_csv', methods=['GET'])
def download_csv():
    return send_from_directory(directory=CSV_DIRECTORY, filename="geometry_parameters.csv", as_attachment=True)


if __name__ == '__main__':
    app.run(debug=True)
