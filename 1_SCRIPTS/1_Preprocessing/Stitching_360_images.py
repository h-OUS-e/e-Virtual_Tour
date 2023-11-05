import cv2
import numpy as np
import matplotlib.pyplot as plt
from omnicv import fisheyeImgConv

# Function to check if any image failed to load
def all_images_loaded(images):
    return all(image is not None for image in images)

# Load the images
image_paths = ['test.png', 'test2.png']
images = [cv2.imread(image_path) for image_path in image_paths]

# Check if we have four images
if not all_images_loaded(images):
    print("Some images are missing or not readable.")
else:
    # Create a stitcher object
    stitcher = cv2.Stitcher_create()

    # Perform the stitching process
    status, stitched_image = stitcher.stitch(images)

    if status == cv2.Stitcher_OK:
        # Save the stitched image
        cv2.imwrite('stitched_panorama4.jpg', stitched_image)
        print("Stitching completed successfully and saved to 'stitched_panorama.jpg'.")
    else:
        print("Stitching failed. Error code:", status)


# Load the user-provided fisheye image
uploaded_fisheye_image_path = '00000-cam2.jpg'
uploaded_fisheye_image = cv2.imread(uploaded_fisheye_image_path)

# Display the loaded fisheye image
plt.imshow(cv2.cvtColor(uploaded_fisheye_image, cv2.COLOR_BGR2RGB))
plt.title('Uploaded Fisheye Image')
plt.axis('off')
plt.show()

# Estimate camera matrix (assuming focal length is equal to the image width)
h, w = uploaded_fisheye_image.shape[:2]
estimated_K = np.array([[w, 0, w/2],
                        [0, w, h/2],
                        [0, 0, 1]])

# Estimate distortion coefficients (assuming strong radial distortion)
# These values are guesses and may need to be adjusted
estimated_D = np.array([-.2,0,-.0,0])

# Attempt to undistort the image with the estimated parameters
new_K = estimated_K.copy()
new_K[0,0] = estimated_K[0,0] /1
new_K[1,1] = estimated_K[1,1] /1
undistorted_image = cv2.fisheye.undistortImage(uploaded_fisheye_image, estimated_K, estimated_D, Knew=new_K)


# Display the undistorted image
plt.imshow(cv2.cvtColor(undistorted_image, cv2.COLOR_BGR2RGB))
plt.title('Undistorted Image (Estimation)')
plt.axis('off')
plt.show()



# import cv2
# import numpy as np

# # Arrays to store object points and image points from all the images.
# objpoints = []  # 3d point in real world space
# imgpoints = []  # 2d points in image plane.

# # Prepare object points, like (0,0,0), (1,0,0), (2,0,0) ...., (6,5,0)
# objp = np.zeros((6*7,3), np.float32)
# objp[:,:2] = np.mgrid[0:7,0:6].T.reshape(-1,2)

# # # Load the images
# image_paths = ['00000-cam0.jpg', '00000-cam1.jpg', '00000-cam2.jpg', '00000-cam3.jpg']
# images = [cv2.imread(image_path) for image_path in image_paths]

# # Iterate over the calibration images to find the checkerboard corners
# for img in images:
#     gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
#     ret, corners = cv2.findChessboardCorners(gray, (7,6), None)

#     if ret == True:
#         objpoints.append(objp)
#         imgpoints.append(corners)

# # Calibrate the camera
# ret, mtx, dist, rvecs, tvecs = cv2.fisheye.calibrate(
#     objpoints, imgpoints, gray.shape[::-1], None, None)

# undistorted_images = []
# for img in images:
#     h, w = img.shape[:2]
#     newcameramtx, roi = cv2.fisheye.estimateNewCameraMatrixForUndistortRectify(
#         mtx, dist, (w, h), np.eye(3), balance=0.0)
#     map1, map2 = cv2.fisheye.initUndistortRectifyMap(
#         mtx, dist, np.eye(3), newcameramtx, (w, h), cv2.CV_16SC2)
#     undistorted_img = cv2.remap(img, map1, map2, interpolation=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)
#     undistorted_images.append(undistorted_img)

# # Use OpenCV's createStitcher function to stitch images
# stitcher = cv2.Stitcher_create()
# status, stitched_image = stitcher.stitch(undistorted_images)