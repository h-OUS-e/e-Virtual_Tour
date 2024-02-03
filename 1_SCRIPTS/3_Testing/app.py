from flask import Flask, request, jsonify, send_from_directory
import csv
import os

app = Flask(__name__)

# Define the directory and file for storing geometry parameters
CSV_DIRECTORY = "1_data"
CSV_FILE_PATH = os.path.join(CSV_DIRECTORY, "transition_nodes.csv")

# Ensure the directory exists
os.makedirs(CSV_DIRECTORY, exist_ok=True)

@app.route('/')
def hello_world():
    return 'Hello, World!'

# Endpoint to add geometry parameters to CSV
@app.route('/add_geometry', methods=['POST'])
def add_geometry():
    data = request.json
    # Check if the CSV file exists and if not, write the header
    file_exists = os.path.isfile(CSV_FILE_PATH)
    with open(CSV_FILE_PATH, 'a', newline='') as csvfile:
        fieldnames = ['Id', 'position', 'backgroundImgId', 'newBackgroundImgId', 'other_parameters']  # Adjust as needed
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        if not file_exists:
            writer.writeheader()  # Write header only once
        writer.writerow(data)
    return jsonify({"success": True, "message": "Geometry added"})

# Endpoint to get all geometries from CSV
@app.route('/get_geometries', methods=['GET'])
def get_geometries():
    geometries = []
    try:
        with open(CSV_FILE_PATH, newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                geometries.append(row)
    except FileNotFoundError:
        return jsonify({"success": False, "message": "File not found"})
    return jsonify(geometries)

@app.route('/download_csv', methods=['GET'])
def download_csv():
    return send_from_directory(directory=CSV_DIRECTORY, filename="geometry_parameters.csv", as_attachment=True)


if __name__ == '__main__':
    app.run(debug=True)
