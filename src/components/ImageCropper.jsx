
import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactCrop from "react-image-crop";
import CanvasPreview from "./CanvasPreview";
import CenterAspectCrop from "./CenterAspectCrop";
import TodoList from "./TodoList";
import "react-image-crop/dist/ReactCrop.css";
import { useNavigate, useLocation } from "react-router-dom";
import "./ImageCropper.css";

function ImageCropper() {
    const previewCanvasRef = useRef(null);
    const imgRef = useRef(null);
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState();
    const [rotate, setRotate] = useState(0);
    const [aspect, setAspect] = useState(16 / 9);
    const navigate = useNavigate();
    const location = useLocation();
    const { imageUrl, taskId } = location.state || {};
    const [imageSrc, setImageSrc] = useState(imageUrl);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (imageUrl) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                const { naturalWidth: width, naturalHeight: height } = img;
                setCrop(CenterAspectCrop(width, height, aspect));
                setImageSrc(imageUrl);
            };
            img.src = imageUrl;
        }
    }, [imageUrl, aspect]);

    useEffect(() => {
        async function updatePreview() {
            if (completedCrop?.width && completedCrop?.height && imgRef.current && previewCanvasRef.current && imageSrc) {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = async () => {
                    await CanvasPreview(img, previewCanvasRef.current, completedCrop, rotate);
                };
                img.src = imageSrc;
            }
        }

        updatePreview();
    }, [completedCrop, rotate, imageSrc]);

    const onImageLoad = useCallback(
        (e) => {
            if (aspect) {
                const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
                setCrop(CenterAspectCrop(width, height, aspect));
            }
        },
        [aspect]
    );

    const onCropChange = (_, percentCrop) => {
        setCrop(percentCrop);
    };

    const onCropComplete = useCallback((c) => {
        setCompletedCrop(c);
    }, []);

    const handleSendCrop = useCallback(() => {
        if (previewCanvasRef.current && completedCrop) {
            previewCanvasRef.current.toBlob(
                async (blob) => {
                    if (blob) {
                        const file = new File([blob], `cropped_${Date.now()}.png`, {
                            type: blob.type,
                            lastModified: Date.now(),
                        });

                        const formData = new FormData();
                        formData.append("image", file);

                        const endpoint = taskId
                            ? "https://todo-todoservices.onrender.com/upload"
                            : "https://todo-todoservices.onrender.com/todo/new";

                        if (!taskId) {
                            const tempUrl = URL.createObjectURL(file);
                            navigate("/TodoList", {
                                state: {
                                    tempCroppedImage: tempUrl,
                                },
                            });
                        } else {
                            formData.append("taskId", taskId);
                        }

                        try {
                            const response = await fetch(endpoint, {
                                method: "POST",
                                body: formData,
                            });

                            if (response.ok) {
                                const data = await response.json();
                                const imagePath = data.imagePath || data.image;

                                console.log("✅ File sent successfully:", imagePath);

                                navigate("/TodoList", {
                                    state: { taskId: data._id || taskId, uploadedImagePath: imagePath },
                                });
                            } else {
                                console.error("Upload failed");
                            }
                        } catch (err) {
                            console.error("Upload error:", err);
                        }
                    }
                },
                "image/png"
            );
        } else {
            console.warn("No completed crop to send.");
        }
    }, [completedCrop, navigate, taskId]);

    const handleRemoveImage = useCallback(() => {
        if (taskId) {
            navigate("/", { state: { taskId: taskId, removeImage: true } });
        } else {
            navigate("/", { state: {} });
        }
    }, [navigate, taskId]);

    const handleReplaceImage = useCallback(
        (event) => {
            const file = event.target.files?.[0];
            if (file) {
                const url = URL.createObjectURL(file);
                setImageSrc(url);
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => {
                    const { naturalWidth, naturalHeight } = img;
                    setCrop(CenterAspectCrop(naturalWidth, naturalHeight, aspect));
                };
                img.src = url;
            }
        },
        [aspect]
    );

    const handleCancel = useCallback(() => {
        navigate("/");
    }, [navigate]);

    const triggerFileInput = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleRotateChange = useCallback((e) => {
        setRotate(Math.min(180, Math.max(-180, Number(e.target.value))));
    }, []);

    const handleToggleAspectClick = useCallback(() => {
        setAspect((prevAspect) => (prevAspect ? undefined : 16 / 9));
    }, []);

    return (
        <div className="image-cropper">
            {imageSrc && (
                <ReactCrop crop={crop} onChange={onCropChange} onComplete={onCropComplete} aspect={aspect}>
                    <img
                        ref={imgRef}
                        alt="Crop me"
                        src={imageSrc}
                        crossOrigin="anonymous"
                        style={{ transform: `rotate(${rotate}deg)` }}
                        onLoad={onImageLoad}
                    />
                </ReactCrop>
            )}

            {completedCrop && (
                <div className="preview-container">
                    <canvas
                        ref={previewCanvasRef}
                        style={{
                            border: "1px solid black",
                            objectFit: "contain",
                            width: Math.round(completedCrop.width),
                            height: Math.round(completedCrop.height),
                        }}
                    />
                    <button onClick={handleSendCrop}>Use Cropped Image</button>
                </div>
            )}

            <div className="controls">
                <div>
                    <label htmlFor="rotate-input">Rotate: </label>
                    <input id="rotate-input" type="number" value={rotate} onChange={handleRotateChange} />
                </div>
                <div>
                    <button onClick={handleToggleAspectClick}>Toggle aspect {aspect ? "off" : "on"}</button>
                </div>
            </div>

            <div className="image-cropper-buttons">
                <button onClick={handleRemoveImage}>Remove Image</button>
                <button onClick={triggerFileInput}>Replace Image</button>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleReplaceImage}
                    style={{ display: "none" }}
                    ref={fileInputRef}
                />
                <button onClick={handleCancel}>Cancel</button>
            </div>
        </div>
    );
}

export default ImageCropper;
