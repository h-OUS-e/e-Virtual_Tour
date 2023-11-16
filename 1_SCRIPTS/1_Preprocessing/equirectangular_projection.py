"""
A script to project fisheye images into a spherical (equirectangular) image.
More information on the algorithm can be found at: https://paulbourke.net/dome/dualfish2sphere/
"""
import numpy as np
import cv2
import matplotlib.pyplot as plt


def pad_image_to_square(image, padding_color=[0, 0, 0]):
    """
    Pad an image on the sides to make it square (width equals height).

    :param image: Input image as a NumPy array.
    :param padding_color: Color of the padding, default is black.
    :return: Padded image as a NumPy array.
    """
    height, width = image.shape[:2]

    # Determine the padding width for each side to make the image square
    padding_width = np.abs((height - width) // 2)

    # Pad the left and right sides of the image
    if height > width:
        padded_image = cv2.copyMakeBorder(image, 
                                        top=0, 
                                        bottom=0, 
                                        left=padding_width, 
                                        right=padding_width, 
                                        borderType=cv2.BORDER_CONSTANT, 
                                        value=padding_color)

        # If the difference in dimensions is odd, add one more pixel of padding to the right
        if (height - width) % 2 != 0:
            padded_image = cv2.copyMakeBorder(padded_image, 
                                            top=0, 
                                            bottom=0, 
                                            left=0, 
                                            right=1, 
                                            borderType=cv2.BORDER_CONSTANT, 
                                            value=padding_color)
    
    else:
        padded_image = cv2.copyMakeBorder(image, 
                                        top=padding_width, 
                                        bottom=padding_width, 
                                        left=0, 
                                        right=0, 
                                        borderType=cv2.BORDER_CONSTANT, 
                                        value=padding_color)

        # If the difference in dimensions is odd, add one more pixel of padding to the right
        if (width - height) % 2 != 0:
            padded_image = cv2.copyMakeBorder(padded_image, 
                                            top=1, 
                                            bottom=0, 
                                            left=0, 
                                            right=0, 
                                            borderType=cv2.BORDER_CONSTANT, 
                                            value=padding_color)


    return padded_image


def crop_image_sides(image, crop_pixels, side='horizontal'):
    """
    Crop an image on the left and right sides by a fixed amount of pixels.

    :param image: Input image as a NumPy array.
    :param crop_pixels: Number of pixels to crop from each side.
    :return: Cropped image as a NumPy array.
    """
    height, width = image.shape[:2]
    
    # Ensure we're not trying to crop more than the width of the image
    if crop_pixels * 2 > width:
        raise ValueError("Trying to crop more pixels than the image width")

    # Crop the image
    if side == 'vertical':
        cropped_image = image[crop_pixels:-crop_pixels, :]
    else:
        cropped_image = image[:, crop_pixels:-crop_pixels]
        

    return cropped_image

# 0. Define input image
image_folder = "new"
img_name = "00001-cam"
image_paths = [f'{img_name}2.jpg',f'{img_name}3.jpg', f'{img_name}0.jpg',f'{img_name}1.jpg']
images = [cv2.imread(f"{image_folder}/{image_path}") for image_path in image_paths]

images = [cv2.imread("test5.jpg")]


def fisheye_map(image, fov=80):
    width, height = image.shape[:2]
    

    image_in_width = source_image.shape[0]
    image_in_height = source_image.shape[1]
    
    image_out_width =  image_in_width
    image_out_height = image_in_width 
    

    antialiasing = 2
    blend_factor = 0.5
    fov = (fov/180)*np.pi

    Cx = image_in_width / 2
    Cy = image_in_height / 2
    image_radius = 1 #max([image_in_height, image_in_width])
    xmax = np.sin(np.pi/2) * np.cos()

    # 1. Define Cartesian Coordinates
    i, j = np.meshgrid(np.arange(image_out_width), np.arange(image_out_height))

    # 2. Normalize Cartesian Coordinates
    i = (i / image_out_width -.5 )*2
    j = (j / image_out_height  -.5)*2

    # 3. Get longitudinal and longitudinal coordinates in spherical coordinates    
    longitude = i * np.pi  
    latitude   = j * np.pi/2

    # 4. Convert Cartesian to Spherical Coordinates
    # Equivalent to arctan(y/x) or arctan(opp/adj)
    x = image_radius * np.cos(latitude) * np.cos(longitude)
    y = image_radius * np.cos(latitude) * np.sin(longitude)
    z = image_radius * np.sin(latitude)

    phi = np.arctan2(np.sqrt(x**2 + z**2), y)
    theta = np.arctan2(z, x) 
    radius = 2 * phi / np.pi * 180 / fov / image_radius

    X = (radius * np.cos(theta)).T.astype(np.float32) - Cx
    Y = (radius * np.sin(theta)).T.astype(np.float32) + Cy

    return X, Y

for idx, image in enumerate(images):
    
    source_image = pad_image_to_square(image)
    X, Y = fisheye_map(image)
    output_image = cv2.remap(source_image, X, Y, interpolation=cv2.INTER_CUBIC, borderMode=cv2.BORDER_CONSTANT)

    plt.imshow(cv2.cvtColor(source_image, cv2.COLOR_BGR2RGB))
    plt.axis('off')
    plt.show()

    # output_image = crop_image_sides(output_image,150)
    # output_image = crop_image_sides(output_image, 50, side='vertical')

    plt.imshow(cv2.cvtColor(output_image, cv2.COLOR_BGR2RGB))
    plt.axis('off')
    plt.show()

    


    cv2.imwrite(image_folder + "/" + image_paths[idx][:-4] + "_warped.jpg", output_image)





# images = [cv2.imread(f"{image_folder}/{image_path[:-4]}_warped.jpg") for image_path in image_paths]
# # Function to check if any image failed to load
# def all_images_loaded(images):
#     return all(image is not None for image in images)


# def crop_black_edges(image):
#     # Convert image to grayscale
#     gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

#     # Threshold the image to create a binary image
#     _, thresh = cv2.threshold(gray, 1, 255, cv2.THRESH_BINARY)

#     # Find contours
#     contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

#     # Find the bounding rectangle for the largest contour
#     max_area = 0
#     best_rect = (0, 0, image.shape[1], image.shape[0])  # Default to full image size
#     for cnt in contours:
#         x, y, w, h = cv2.boundingRect(cnt)
#         area = w * h
#         if area > max_area:
#             max_area = area
#             best_rect = x, y, w, h

#     # Crop the image
#     x, y, w, h = best_rect
#     cropped_image = image[y:y+h, x:x+w]

#     return cropped_image

# # Check if we have four images
# if not all_images_loaded(images):
#     print("Some images are missing or not readable.")
# else:
#     # Create a stitcher object
#     stitcher = cv2.Stitcher_create(mode=0)

#     # Perform the stitching process"
#     status, stitched_image = stitcher.stitch(images)
#     # stitched_image = crop_black_edges(stitched_image)
#     if status == cv2.Stitcher_OK:
#         # Save the stitched image
#         cv2.imwrite(f'{image_folder}/{img_name}_stitched_panorama.jpg', stitched_image)
#         plt.imshow(cv2.cvtColor(stitched_image, cv2.COLOR_BGR2RGB))
#         print("Stitching completed successfully and saved to 'stitched_panorama.jpg'.")
#     else:
#         print("Stitching failed. Error code:", status)







# def stitch_two_images(img1, img2):
#     # Convert images to grayscale
#     gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
#     gray2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)

#     # Create SIFT detector and descriptor
#     sift = cv2.SIFT_create()

#     # Find keypoints and descriptors
#     keypoints1, descriptors1 = sift.detectAndCompute(gray1, None)
#     keypoints2, descriptors2 = sift.detectAndCompute(gray2, None)

#     # FLANN parameters
#     FLANN_INDEX_KDTREE = 1
#     index_params = dict(algorithm=FLANN_INDEX_KDTREE, trees=5)
#     search_params = dict(checks=50)

#     # Create FLANN matcher
#     flann = cv2.FlannBasedMatcher(index_params, search_params)

#     # Match descriptors
#     matches = flann.knnMatch(descriptors1, descriptors2, k=2)

#     # Lowe's ratio test to filter good matches
#     good_matches = []
#     for m, n in matches:
#         if m.distance < 0.7 * n.distance:
#             good_matches.append(m)

#     # Extract location of good matches
#     points1 = np.zeros((len(good_matches), 2), dtype=np.float32)
#     points2 = np.zeros((len(good_matches), 2), dtype=np.float32)

#     # Homography if enough good matches are found
#     MIN_MATCH_COUNT = 10
#     if len(good_matches) > MIN_MATCH_COUNT:
#         src_pts = np.float32([keypoints1[m.queryIdx].pt for m in good_matches]).reshape(-1, 1, 2)
#         dst_pts = np.float32([keypoints2[m.trainIdx].pt for m in good_matches]).reshape(-1, 1, 2)

#         # Find homography matrix
#         H, _ = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)

#         # Use homography
#         height, width, channels = img2.shape
#         img1_warped = cv2.warpPerspective(img1, H, (width, height))

#         # Overlap images
#         img1_warped[0:height, 0:width] = img2
#         return img1_warped
#     else:
#         print("Not enough matches found - %d/%d" % (len(good_matches), MIN_MATCH_COUNT))
#         return None

# # Load images
# img1 = images[0]
# img2 = images[1]
# img3 = images[2]
# img4 = images[3]

# # Stitch images in pairs
# result_12 = stitch_two_images(img1, img2)
# result_34 = stitch_two_images(img3, img4)

# # Check if stitching was successful
# if result_12 is not None and result_34 is not None:
#     # Stitch the results
#     final_result = stitch_two_images(result_12, result_34)

#     # Display the final stitched image
#     if final_result is not None:
#         cv2.imshow('Final Stitched Image', result_34)
#         cv2.waitKey(0)
#         cv2.destroyAllWindows()
#     else:
#         print("Final stitching failed.")
# else:
#     print("Pairwise stitching failed.")