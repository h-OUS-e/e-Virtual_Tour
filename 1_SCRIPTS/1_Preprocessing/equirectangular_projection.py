"""
A script to project fisheye images into a spherical (equirectangular) image.
More information on the algorithm can be found at: https://paulbourke.net/dome/dualfish2sphere/
Check this link for stitching https://github.com/ndvinh98/Panorama/blob/master/Step_By_Step.ipynb
"""
import numpy as np
import cv2
import matplotlib.pyplot as plt
import glob


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
image_folder = "new3"
img_name = "00112-cam"
image_paths = glob.glob(f"{image_folder}/{img_name}*.jpg")
images = [cv2.imread(image_path) for image_path in image_paths]
shift=1
images = images[-shift:] + images[:-shift]

def fisheye_mapping(img_width, img_height, fov=1):
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
    r = img_width * np.arctan2(np.sqrt(X_spherical_coord**2 + Y_spherical_coord**2), Z_spherical_coord )/ fov
    x_polar = r * np.cos(theta_polar)+img_width/2
    y_polar = r * np.sin(theta_polar)+img_width/2

    return x_polar.astype(np.float32), y_polar.astype(np.float32)


def crop_black_edges(image, tolerance=5):
    """
    Crop black borders from an image.
    :param image: Input image
    :param tolerance: Pixel intensity below which is considered black. Default is 5.
    :return: Cropped image
    """
    # If image is color, convert it to grayscale
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image

    # Create a binary mask where non-black pixels are marked
    _, thresh = cv2.threshold(gray, tolerance, 255, cv2.THRESH_BINARY)

    # Find the coordinates of non-black pixels
    coords = np.column_stack(np.where(thresh > 0))

    # Find the bounding box of those pixels
    x, y, w, h = cv2.boundingRect(coords)

    # Crop the image using the bounding box
    cropped_image = image[y:y+h, x:x+w]

    return cropped_image


output_images = []

for idx, image in enumerate(images):

    # image=crop_image_sides(image, 50,'vertical')
    # image=crop_image_sides(image, 25,'horizontal')

    source_image = pad_image_to_square(image)
    
    plt.imshow(cv2.cvtColor(source_image, cv2.COLOR_BGR2RGB))
    plt.title('Uploaded Fisheye Image')
    plt.axis('off')
    plt.show()

    # # Estimate camera matrix (assuming focal length is equal to the image width)
    # h, w = source_image.shape[:2]
    # estimated_K = np.array([[w, 0, w/2],
    #                         [0, w, h/2],
    #                         [0, 0, 1]])

    # # Estimate distortion coefficients (assuming strong radial distortion)
    # # These values are guesses and may need to be adjusted
    # estimated_D = np.array([.2,-.03,-.000,.00])

    # # Attempt to undistort the image with the estimated parameters
    # new_K = estimated_K.copy()
    # new_K[0,0] = estimated_K[0,0] 
    # new_K[1,1] = estimated_K[1,1]
    # source_image = cv2.fisheye.undistortImage(source_image, estimated_K, estimated_D, Knew=new_K)

    # # Display the undistorted image
    # plt.imshow(cv2.cvtColor(source_image, cv2.COLOR_BGR2RGB))
    # plt.title('undistorted Fisheye Image')
    # plt.axis('off')
    # plt.show()



    
    X, Y = fisheye_mapping(source_image.shape[0], source_image.shape[1], fov=180)
    output_image = cv2.remap(source_image, X, Y, interpolation=cv2.INTER_CUBIC, borderMode=cv2.BORDER_CONSTANT)
    output_image = cv2.rotate(output_image, cv2.ROTATE_180)
    output_image=crop_image_sides(output_image, 100,'vertical')
    
    output_image=crop_image_sides(output_image, 200,'horizontal')
    # output_image = crop_black_edges(output_image)
    # output_image = cv2.resize(output_image, (int(output_image.shape[0]/.75), output_image.shape[1]))
    output_images.append(output_image)

    plt.imshow(cv2.cvtColor(output_image, cv2.COLOR_BGR2RGB))
    plt.title('remapped equirectangular Image')
    plt.axis('off')
    plt.show()
    


    cv2.imwrite(image_folder + "/warped_" + image_paths[idx][len(image_folder)+2:] + ".jpg", output_image)





# Function to check if any image failed to load
def all_images_loaded(images):
    return all(image is not None for image in images)




# Check if we have four images
if not all_images_loaded(output_images):
    print("Some images are missing or not readable.")
else:
    # Create a stitcher object
    stitcher = cv2.Stitcher_create(mode=cv2.STITCHER_PANORAMA)

    # Perform the stitching process"
    status, stitched_image = stitcher.stitch(output_images)
    # stitched_image = crop_black_edges(stitched_image)
    if status == cv2.Stitcher_OK:
        # Save the stitched image
        cv2.imwrite(f'{image_folder}/stitched_panorama_{img_name}.jpg', stitched_image)
        plt.imshow(cv2.cvtColor(stitched_image, cv2.COLOR_BGR2RGB))
        print("Stitching completed successfully and saved to 'stitched_panorama.jpg'.")
    else:
        print("Stitching failed. Error code:", status)





# Load images
img1 = output_images[0]
img2 = output_images[1]
img3 = output_images[2]
img4 = output_images[3]

# def findAndDescribeFeatures(image):
#     # Getting gray image
#     grayImage = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
#     #extract keypoints and descriptors using sift
#     md = cv2.SIFT_create()
#     keypoints, features = md.detectAndCompute(grayImage, None)
#     features = np.float32(features)
#     return keypoints, features



# def matchFeatures(featuresA, featuresB, ratio=0.75, opt="FB"):
#     """matching features beetween 2 @features.
#          If opt='FB', FlannBased algorithm is used.
#          If opt='BF', BruteForce algorithm is used.
#          @ratio is the Lowe's ratio test.
#          @return matches"""
#     if opt == "BF":
#         featureMatcher = cv2.DescriptorMatcher_create("BruteForce")
#     if opt == "FB":
#         # featureMatcher = cv2.DescriptorMatcher_create("FlannBased")
#         FLANN_INDEX_KDTREE = 0
#         index_params = dict(algorithm=FLANN_INDEX_KDTREE, trees=5)
#         search_params = dict(checks=50)
#         featureMatcher = cv2.FlannBasedMatcher(index_params, search_params)

#     # performs k-NN matching between the two feature vector sets using k=2
#     # (indicating the top two matches for each feature vector are returned).
#     matches = featureMatcher.knnMatch(featuresA, featuresB, k=2)

#     # store all the good matches as per Lowe's ratio test.
#     good = []
#     for m, n in matches:
#         if m.distance < ratio * n.distance:
#             good.append(m)
#     if len(good) > 4:
#         return good
#     raise Exception("Not enought matches")

# def generateHomography(src_img, dst_img, ransacRep=5.0):
#     """@Return Homography matrix, @param src_img is the image which is warped by homography,
#         @param dst_img is the image which is choosing as pivot, @param ratio is the David Lowe’s ratio,
#         @param ransacRep is the maximum pixel “wiggle room” allowed by the RANSAC algorithm
#         """

#     src_kp, src_features = findAndDescribeFeatures(src_img)
#     dst_kp, dst_features = findAndDescribeFeatures(dst_img)

#     good = matchFeatures(src_features, dst_features)

#     src_points = np.float32([src_kp[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
#     dst_points = np.float32([dst_kp[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)

#     H, mask = cv2.findHomography(src_points, dst_points, cv2.RANSAC, ransacRep)
#     matchesMask = mask.ravel().tolist()
#     return H, matchesMask


# def drawKeypoints(img, kp):
#     img1 = img
#     cv2.drawKeypoints(img, kp, img1, flags=cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)
#     return img1

# def drawMatches(src_img, src_kp, dst_img, dst_kp, matches, matchesMask):
#     draw_params = dict(
#         matchColor=(0, 255, 0),  # draw matches in green color
#         singlePointColor=None,
#         matchesMask=matchesMask[:100],  # draw only inliers
#         flags=2,
#     )
#     return cv2.drawMatches(
#         src_img, src_kp, dst_img, dst_kp, matches[:100], None, **draw_params
#     )



# def convertResult(img):
#     '''Because of your images which were loaded by opencv, 
#     in order to display the correct output with matplotlib, 
#     you need to reduce the range of your floating point image from [0,255] to [0,1] 
#     and converting the image from BGR to RGB:'''
#     img = np.array(img,dtype=float)/float(255)
#     img = img[:,:,::-1]
#     return img
    




# #extract keypoints and descriptors using sift
# k0,f0=findAndDescribeFeatures(img1)
# k1,f1=findAndDescribeFeatures(img2)


# #draw keypoints
# img0_kp=drawKeypoints(img1.copy(),k0)
# img1_kp=drawKeypoints(img2.copy(),k1)

# plt_img = np.concatenate((img0_kp, img1_kp), axis=1)
# plt.figure(figsize=(15,15))
# plt.imshow(convertResult(plt_img))



# #matching features using BruteForce 
# mat=matchFeatures(f0,f1,ratio=0.6,opt='FB')


# #Computing Homography matrix and mask
# H,matMask=generateHomography(img1,img2)


# #draw matches
# img=drawMatches(img1,k0,img2,k1,mat,matMask)
# plt.figure(figsize=(15,15))
# plt.imshow(convertResult(img))

# def blendingMask(height, width, barrier, smoothing_window, left_biased=True):
#     assert barrier < width
#     mask = np.zeros((height, width))

#     offset = int(smoothing_window / 2)
#     try:
#         if left_biased:
#             mask[:, barrier - offset : barrier + offset + 1] = np.tile(
#                 np.linspace(1, 0, 2 * offset + 1).T, (height, 1)
#             )
#             mask[:, : barrier - offset] = 1
#         else:
#             mask[:, barrier - offset : barrier + offset + 1] = np.tile(
#                 np.linspace(0, 1, 2 * offset + 1).T, (height, 1)
#             )
#             mask[:, barrier + offset :] = 1
#     except BaseException:
#         if left_biased:
#             mask[:, barrier - offset : barrier + offset + 1] = np.tile(
#                 np.linspace(1, 0, 2 * offset).T, (height, 1)
#             )
#             mask[:, : barrier - offset] = 1
#         else:
#             mask[:, barrier - offset : barrier + offset + 1] = np.tile(
#                 np.linspace(0, 1, 2 * offset).T, (height, 1)
#             )
#             mask[:, barrier + offset :] = 1

#     return cv2.merge([mask, mask, mask])
# def crop(panorama, h_dst, conners):
#     """crop panorama based on destination.
#     @param panorama is the panorama
#     @param h_dst is the hight of destination image
#     @param conner is the tuple which containing 4 conners of warped image and
#     4 conners of destination image"""
#     # find max min of x,y coordinate
#     [xmin, ymin] = np.int32(conners.min(axis=0).ravel() - 0.5)
#     t = [-xmin, -ymin]
#     conners = conners.astype(int)

#     # conners[0][0][0] is the X coordinate of top-left point of warped image
#     # If it has value<0, warp image is merged to the left side of destination image
#     # otherwise is merged to the right side of destination image
#     if conners[0][0][0] < 0:
#         n = abs(-conners[1][0][0] + conners[0][0][0])
#         panorama = panorama[t[1] : h_dst + t[1], n:, :]
#     else:
#         if conners[2][0][0] < conners[3][0][0]:
#             panorama = panorama[t[1] : h_dst + t[1], 0 : conners[2][0][0], :]
#         else:
#             panorama = panorama[t[1] : h_dst + t[1], 0 : conners[3][0][0], :]
#     return panorama

# def panoramaBlending(dst_img_rz, src_img_warped, width_dst, side, showstep=False):
#     """Given two aligned images @dst_img and @src_img_warped, and the @width_dst is width of dst_img
#     before resize, that indicates where there is the discontinuity between the images,
#     this function produce a smoothed transient in the overlapping.
#     @smoothing_window is a parameter that determines the width of the transient
#     left_biased is a flag that determines whether it is masked the left image,
#     or the right one"""

#     h, w, _ = dst_img_rz.shape
#     smoothing_window = int(width_dst / 8)
#     barrier = width_dst - int(smoothing_window / 2)
#     mask1 = blendingMask(
#         h, w, barrier, smoothing_window=smoothing_window, left_biased=True
#     )
#     mask2 = blendingMask(
#         h, w, barrier, smoothing_window=smoothing_window, left_biased=False
#     )

#     if showstep:
#         nonblend = src_img_warped + dst_img_rz
#     else:
#         nonblend = None
#         leftside = None
#         rightside = None

#     if side == "left":
#         dst_img_rz = cv2.flip(dst_img_rz, 1)
#         src_img_warped = cv2.flip(src_img_warped, 1)
#         dst_img_rz = dst_img_rz * mask1
#         src_img_warped = src_img_warped * mask2
#         pano = src_img_warped + dst_img_rz
#         pano = cv2.flip(pano, 1)
#         if showstep:
#             leftside = cv2.flip(src_img_warped, 1)
#             rightside = cv2.flip(dst_img_rz, 1)
#     else:
#         dst_img_rz = dst_img_rz * mask1
#         src_img_warped = src_img_warped * mask2
#         pano = src_img_warped + dst_img_rz
#         if showstep:
#             leftside = dst_img_rz
#             rightside = src_img_warped

#     return pano, nonblend, leftside, rightside
# def warpTwoImages(src_img, dst_img, showstep=False):

#     # generate Homography matrix
#     H, _ = generateHomography(src_img, dst_img)

#     # get height and width of two images
#     height_src, width_src = src_img.shape[:2]
#     height_dst, width_dst = dst_img.shape[:2]

#     # extract conners of two images: top-left, bottom-left, bottom-right, top-right
#     pts1 = np.float32(
#         [[0, 0], [0, height_src], [width_src, height_src], [width_src, 0]]
#     ).reshape(-1, 1, 2)
#     pts2 = np.float32(
#         [[0, 0], [0, height_dst], [width_dst, height_dst], [width_dst, 0]]
#     ).reshape(-1, 1, 2)

#     try:
#         # aply homography to conners of src_img
#         pts1_ = cv2.perspectiveTransform(pts1, H)
#         pts = np.concatenate((pts1_, pts2), axis=0)

#         # find max min of x,y coordinate
#         [xmin, ymin] = np.int64(pts.min(axis=0).ravel() - 0.5)
#         [_, ymax] = np.int64(pts.max(axis=0).ravel() + 0.5)
#         t = [-xmin, -ymin]

#         # top left point of image which apply homography matrix, which has x coordinate < 0, has side=left
#         # otherwise side=right
#         # source image is merged to the left side or right side of destination image
#         if pts[0][0][0] < 0:
#             side = "left"
#             width_pano = width_dst + t[0]
#         else:
#             width_pano = int(pts1_[3][0][0])
#             side = "right"
#         height_pano = ymax - ymin

#         # Translation
#         # https://stackoverflow.com/a/20355545
#         Ht = np.array([[1, 0, t[0]], [0, 1, t[1]], [0, 0, 1]])
#         src_img_warped = cv2.warpPerspective(
#             src_img, Ht.dot(H), (width_pano, height_pano)
#         )
#         # generating size of dst_img_rz which has the same size as src_img_warped
#         dst_img_rz = np.zeros((height_pano, width_pano, 3))
#         if side == "left":
#             dst_img_rz[t[1] : height_src + t[1], t[0] : width_dst + t[0]] = dst_img
#         else:
#             dst_img_rz[t[1] : height_src + t[1], :width_dst] = dst_img

#         # blending panorama
#         pano, nonblend, leftside, rightside = panoramaBlending(
#             dst_img_rz, src_img_warped, width_dst, side, showstep=showstep
#         )

#         # croping black region
#         pano = crop(pano, height_dst, pts)
#         return pano, nonblend, leftside, rightside
#     except BaseException:
#         raise Exception("Please try again with another image set!")
    
# def multiStitching(images):
#     """assume that the list_images was supplied in left-to-right order, choose middle image then
#     divide the array into 2 sub-arrays, left-array and right-array. Stiching middle image with each
#     image in 2 sub-arrays. @param list_images is The list which containing images, @param smoothing_window is
#     the value of smoothy side after stitched, @param output is the folder which containing stitched image
#     """
#     pano1,non_blend,left_side,right_side=warpTwoImages(images[0],images[3],True)
#     pano2,non_blend,left_side,right_side=warpTwoImages(images[2],images[1],True)
#     if pano2 is None or pano2.size == 0:
#         print("Panorama 2 is empty or not loaded correctly")
#     if pano1 is None or pano1.size == 0:
#         print("Panorama 1 is empty or not loaded correctly")
    
#     if pano1.dtype != np.uint8:
#         # Normalize the image to 0-255 and convert to uint8
#         norm_image = cv2.normalize(pano1, None, alpha=0, beta=255, norm_type=cv2.NORM_MINMAX)
#         pano1 = norm_image.astype(np.uint8)
#     else:
#         pano1 = pano1

#     if pano2.dtype != np.uint8:
#         # Normalize the image to 0-255 and convert to uint8
#         norm_image = cv2.normalize(pano2, None, alpha=0, beta=255, norm_type=cv2.NORM_MINMAX)
#         pano2 = norm_image.astype(np.uint8)
#     else:
#         pano2 = pano2
#     plt.figure(figsize=(15,15))
#     plt.imshow(convertResult(pano1))
#     plt.figure(figsize=(15,15))
#     plt.imshow(convertResult(pano2))
#     fullpano,non_blend,left_side,right_sid = warpTwoImages(pano1,pano2,True)

#     return fullpano

# pano = multiStitching(output_images)

# #pano after cropping and blending
# plt.figure(figsize=(15,15))
# plt.imshow(convertResult(pano))


