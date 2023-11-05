"""
A script to project fisheye images into a spherical (equirectangular) image.
More information on the algorithm can be found at: https://paulbourke.net/dome/dualfish2sphere/
"""
import numpy as np
import cv2 as cv


image_width = 1024
image_height = 1024
antialiasing = 2
blend_factor = 0.5
fov = 60.0


# Normalized Cartesian Coordinates
# Spherical Coordinates

# 1. Define Polar Coordinates
i,j = np.meshgrid(np.arange(image_width), np.arange(image_height))

# 2. Normalize Polar Coordinates
radius = image_width / 2.0

# Equivalent to arctan(y/x) or arctan(opp/adj)
theta = np.arctan2(y,x)*180/np.pi
