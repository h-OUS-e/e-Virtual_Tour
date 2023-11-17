import numpy as np
import cv2
import matplotlib.pyplot as plt
import plotly.graph_objects as go
from mpl_toolkits.mplot3d import Axes3D
import glob


x = np.array([1, 2, 3])
y = np.array([2, 3, 4])
z = np.array([3, 4, 5])

image_out_width = 50
image_out_height = 50
image_folder = "new"
img_name = "00001"

image_paths = glob.glob(f"{image_folder}/{img_name}*.jpg")
images = [cv2.imread(image_path) for image_path in image_paths]

source_img = images[0]


def fisheye_mapping(img_width, img_height, fov=100):
    x_rect, y_rect = np.meshgrid(np.linspace(0, 1, img_width), 
                            np.linspace(0, 1, img_height))
    x_rect=x_rect
    y_rect=y_rect



    theta = (x_rect) * np.pi
    phi = (y_rect) * np.pi 
    fov = (fov/180)*np.pi

    r = 1
    X_spherical_coord = r * np.sin(phi) * np.cos(theta)
    Y_spherical_coord = r * np.cos(phi) 
    Z_spherical_coord = r * np.sin(phi) * np.sin(theta)
    color = np.array([x_rect, y_rect, x_rect*0]).T

    

    # Convert Spherical to polar coordinates (fisheye coordinates)
    theta_polar = np.arctan2(Y_spherical_coord, X_spherical_coord)
    r = 2 * np.arctan2(np.sqrt(X_spherical_coord**2 + Y_spherical_coord**2), Z_spherical_coord )/ fov
    x_polar = r * np.cos(theta_polar)+img_height/2
    y_polar = r * np.sin(theta_polar)+img_width/2

    return x_polar.astype(np.float32), y_polar.astype(np.float32), color,X_spherical_coord,Y_spherical_coord,Z_spherical_coord



import cv2
import numpy as np
import matplotlib.pyplot as plt


def fisheye_transform(image, strength=4, radius=100):
    """
    Apply fisheye effect to an image.
    :param image: Input image
    :param strength: Strength of the fisheye effect
    :param radius: Radius of the fisheye effect
    :return: Image with fisheye effect
    """
    dst = np.zeros_like(image)

    for i in range(image.shape[1]):
        for j in range(image.shape[0]):
            # Normalize (x, y) coordinates to (-1, 1)
            x = (i - image.shape[1] / 2) / (image.shape[1] / 2)
            y = (j - image.shape[0] / 2) / (image.shape[0] / 2)

            # Convert to polar coordinates
            r = np.sqrt(x**2 + y**2)
            theta = np.arctan2(y, x)

            # Fisheye transformation
            r = r ** strength

            # Convert back to rectangular coordinates
            x_new = int(radius * r * np.cos(theta) + image.shape[1] / 2)
            y_new = int(radius * r * np.sin(theta) + image.shape[0] / 2)

            # Assign pixel value if it's within the image boundaries
            if 0 <= x_new < image.shape[1] and 0 <= y_new < image.shape[0]:
                dst[j, i] = image[y_new, x_new]

    return dst

# Create a checkerboard pattern for the demonstration
def create_checkerboard(width, height, cell_size):
    board = np.zeros((height, width, 3), dtype=np.uint8)
    for y in range(0, height, cell_size):
        for x in range(0, width, cell_size):
            if (x // cell_size + y // cell_size) % 2:
                board[y:y+cell_size, x:x+cell_size] = 255
    return board

# Generate a checkerboard image
checkerboard_image = create_checkerboard(300, 300, 30)

# Apply fisheye effect
source_img = fisheye_transform(checkerboard_image)


# # Display the original and fisheye images
# plt.figure(figsize=(12, 6))
# plt.subplot(1, 2, 1)
# plt.imshow(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
# plt.title('Original Image')
# plt.axis('off')

# plt.subplot(1, 2, 2)
# plt.imshow(cv2.cvtColor(fisheye_image, cv2.COLOR_BGR2RGB))
# plt.title('Fisheye Image')
# plt.axis('off')

# plt.show()
# source_img = images[0]
# # resizing image
# source_img = cv2.resize(source_img, (source_img.shape[1]//10, source_img.shape[0]//10))

x,y,c,X_spherical_coord,Y_spherical_coord,Z_spherical_coord = fisheye_mapping(source_img.shape[0], source_img.shape[1])
output_image = cv2.remap(source_img, x, y, interpolation=cv2.INTER_CUBIC, borderMode=cv2.BORDER_CONSTANT)
c=source_img/255








# # Specify the marker size
marker_size = 1  # Adjust this value as needed

fig = go.Figure(data=[go.Scatter3d(
    x=X_spherical_coord.flatten(), 
    y=Y_spherical_coord.flatten(), 
    z=Z_spherical_coord.flatten(), 
    mode='markers',
    marker=dict(
        size=marker_size,  # Set the marker size here
        color=c.reshape((-1,3)),  # Set the color here
    )
)])

# Adjusting the scale
fig.update_layout(
    scene=dict(
        aspectmode='manual',  # Options: 'auto', 'cube', 'data', 'manual'
        aspectratio=dict(x=1, y=1, z=1),
        xaxis=dict(range=[-1, 1]),
        yaxis=dict(range=[-1, 1]),
        zaxis=dict(range=[-1, 1])
    )
)

fig.show()


fig = plt.figure()
ax = fig.add_subplot()
# Example: Scatter plot
plt.imshow(cv2.cvtColor(source_img, cv2.COLOR_BGR2RGB))
# For a surface plot, use: ax.plot_surface(X, Y, Z)
plt.show()

fig = plt.figure()
ax = fig.add_subplot()
# Example: Scatter plot
plt.imshow(cv2.cvtColor(output_image, cv2.COLOR_BGR2RGB))
# For a surface plot, use: ax.plot_surface(X, Y, Z)
plt.show()

# fig = plt.figure()
# ax = fig.add_subplot(111, projection='3d')
# # Example: Scatter plot
# ax.scatter(X_spherical_coord, Y_spherical_coord, Z_spherical_coord, s=1 , c=color)
# # For a surface plot, use: ax.plot_surface(X, Y, Z)
# # Setting the view
# elevation_angle = 90  # degrees
# azimuthal_angle = -90  # degrees
# ax.view_init(elev=elevation_angle, azim=azimuthal_angle)

# plt.show()

fig = plt.figure(figsize=(10,10))
ax = fig.add_subplot()
# Example: Scatter plot
ax.scatter(x.reshape((-1,1)), y.reshape((-1,1)),  c=c.reshape((-1,3)), s=1)

plt.show()

