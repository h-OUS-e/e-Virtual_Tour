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
image_paths = ['00001-cam0.jpg','00001-cam1.jpg', '00001-cam2.jpg','00001-cam3.jpg']
images = [cv2.imread(f"{image_folder}/{image_path}") for image_path in image_paths]
for idx, image in enumerate(images):
    width, height = image.shape[:2]
    source_image = pad_image_to_square(image)

    image_in_width = source_image.shape[0]
    image_in_height = source_image.shape[1]
    
    image_out_width =  image_in_width
    image_out_height = image_in_width 
    

    antialiasing = 2
    blend_factor = 0.5
    fov = 60.0
    aperture = .385

    Cx = image_in_width / 2
    Cy = image_in_height / 2
    image_radius = 1 #max([image_in_height, image_in_width])/2

    # 1. Define Cartesian Coordinates"
    i, j = np.meshgrid(np.arange(image_out_width), np.arange(image_out_height))

    # 2. Normalize Cartesian Coordinates
    i = i / image_out_width -.5 
    j = j / image_out_height  -.5

    # 3. Get longitudinal and longitudinal coordinates in spherical coordinates    
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

    X = (radius * np.cos(theta)).T.astype(np.float32) + Cy
    Y = (radius * np.sin(theta)).T.astype(np.float32) + Cx

    output_image = cv2.remap(source_image, X, Y, interpolation=cv2.INTER_CUBIC, borderMode=cv2.BORDER_CONSTANT)

    plt.imshow(cv2.cvtColor(source_image, cv2.COLOR_BGR2RGB))
    plt.axis('off')
    plt.show()

    output_image = crop_image_sides(output_image,100)
    output_image = crop_image_sides(output_image, 100, side='vertical')

    plt.imshow(cv2.cvtColor(output_image, cv2.COLOR_BGR2RGB))
    plt.axis('off')
    plt.show()

    


    cv2.imwrite(image_folder + "/" + image_paths[idx][:-4] + "_warped.jpg", output_image)





image_paths = ['00000-cam0_warped.jpg', '00000-cam1_warped.jpg', '00000-cam2_warped.jpg','00000-cam3_warped.jpg']
images = [cv2.imread(f"{image_folder}/{image_path}") for image_path in image_paths]
# Function to check if any image failed to load
def all_images_loaded(images):
    return all(image is not None for image in images)



# Check if we have four images
if not all_images_loaded(images):
    print("Some images are missing or not readable.")
else:
    # Create a stitcher object
    stitcher = cv2.Stitcher_create(mode=0)

    # Perform the stitching process"
    status, stitched_image = stitcher.stitch(images)
    if status == cv2.Stitcher_OK:
        # Save the stitched image
        cv2.imwrite('stitched_panorama8.jpg', stitched_image)
        plt.imshow(cv2.cvtColor(stitched_image, cv2.COLOR_BGR2RGB))
        print("Stitching completed successfully and saved to 'stitched_panorama.jpg'.")
    else:
        print("Stitching failed. Error code:", status)