"""
A script to project fisheye images into a spherical (equirectangular) image.
More information on the algorithm can be found at: https://paulbourke.net/dome/dualfish2sphere/
"""
import numpy as np
import cv2
import matplotlib.pyplot as plt




# 0. Define input image
image_paths = ['00000-cam0.jpg']
images = [cv2.imread(image_path) for image_path in image_paths]

source_image = images[0]

image_in_width = source_image.shape[1]
image_in_height = source_image.shape[0]
image_out_width = image_in_width
image_out_height = image_in_height

antialiasing = 2
blend_factor = 0.5
fov = 60.0
aperture = .6

Cx = image_in_width / 2
Cy = image_in_height / 2

# 1. Define Cartesian Coordinates
i,j = np.meshgrid(np.arange(image_out_width), np.arange(image_out_height))

# 2. Normalize Cartesian Coordinates
i = i / image_out_width -.5 
j = j / image_out_height -.5 

# 3. Get longitudinal and longitudinal coordinates in spherical coordinates
image_radius = 1 # min([image_in_height, image_in_width]) / max([image_in_height, image_in_width])
longitude = i * np.pi 
latitude   = j * np.pi 

# 4. Convert Cartesian to Spherical Coordinates
# Equivalent to arctan(y/x) or arctan(opp/adj)
x = image_radius * np.cos(longitude) * np.sin(latitude)
y = image_radius * np.cos(longitude) * np.cos(latitude)
z = image_radius * np.sin(longitude)

phi = np.arctan2(np.sqrt(x**2 + z**2), y)
theta = np.arctan2(z, x) 
radius = 2 * phi / np.pi * 180 / aperture * image_radius

X = (radius * np.cos(theta)).T.astype(np.float32) + Cx
Y = (radius * np.sin(theta)).T.astype(np.float32) + Cy

output_image = cv2.remap(source_image, X, Y, interpolation=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)

plt.imshow(cv2.cvtColor(source_image, cv2.COLOR_BGR2RGB))
plt.axis('off')
plt.show()

plt.imshow(cv2.cvtColor(output_image, cv2.COLOR_BGR2RGB))
plt.axis('off')
plt.show()