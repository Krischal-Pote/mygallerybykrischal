import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Pagination,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import { saveAs } from "file-saver";

interface Image {
  id: string;
  author: string;
  download_url: string;
  width: number;
  height: number;
}

const Gallery: React.FC = () => {
  const [images, setImages] = useState<Image[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<Image | null>(null);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const imagesPerPage = 12;

  useEffect(() => {
    const fetchImages = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `https://picsum.photos/v2/list?page=${currentPage}&limit=${imagesPerPage}`
        );
        setImages(response.data);
      } catch (error) {
        console.error("Error fetching images:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchImages();
  }, [currentPage]);

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
  };

  const handleImageClick = (image: Image) => {
    setSelectedImage(image);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedImage(null);
  };

  const handleDownload = async () => {
    if (selectedImage) {
      try {
        const response = await fetch(selectedImage.download_url);
        const blob = await response.blob();
        saveAs(blob, `Image_by_${selectedImage.author}.jpg`);
      } catch (error) {
        console.error("Download failed:", error);
      }
    }
  };

  const handleMouseEnter = () => {
    setIsZooming(true);
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
    setZoomPosition({ x: 0, y: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { offsetX, offsetY, target } = e.nativeEvent;
    const { offsetWidth, offsetHeight } = target as HTMLElement;

    const xPercent = (offsetX / offsetWidth) * 100;
    const yPercent = (offsetY / offsetHeight) * 100;

    setZoomPosition({ x: xPercent, y: yPercent });
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Image Gallery</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading
          ? Array.from({ length: imagesPerPage }).map((_, index) => (
              <div
                key={index}
                className="bg-gray-300 animate-pulse rounded-lg h-64"
              ></div>
            ))
          : images.map((image) => (
              <div
                key={image.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer"
                onClick={() => handleImageClick(image)}
              >
                <img
                  src={image.download_url}
                  alt={image.author}
                  className="w-full h-64 object-cover"
                  loading="lazy"
                />
                <div className="p-4">
                  <h2 className="text-lg font-semibold">{image.author}</h2>
                </div>
              </div>
            ))}
      </div>

      <div className="flex justify-center mt-8">
        <Pagination
          count={10}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </div>

      {selectedImage && (
        <Dialog
          open={isDialogOpen}
          onClose={closeDialog}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>
            <div className="flex justify-between items-center">
              <span>{selectedImage.author}</span>
              <IconButton onClick={closeDialog}>
                <CloseIcon />
              </IconButton>
            </div>
          </DialogTitle>
          <DialogContent>
            <div className="relative">
              <div
                className="relative w-full h-auto overflow-hidden"
                onMouseEnter={handleMouseEnter}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <img
                  src={selectedImage.download_url}
                  alt={selectedImage.author}
                  className="w-full h-auto max-h-[500px] object-contain"
                />
              </div>

              {isZooming && (
                <div
                  className="fixed border-2 border-gray-300 shadow-lg pointer-events-none"
                  style={{
                    width: "400px",
                    height: "300px",
                    backgroundImage: `url(${selectedImage.download_url})`,
                    backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    backgroundSize: "300%",
                    top: "39.3%",
                    left: "80%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 9999,
                  }}
                />
              )}

              <div className="mt-4 flex justify-between items-center">
                <div>
                  <p>
                    <strong>Author:</strong> {selectedImage.author}
                  </p>
                  <p>
                    <strong>Dimensions:</strong> {selectedImage.width} x{" "}
                    {selectedImage.height}
                  </p>
                </div>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownload}
                >
                  Download
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Gallery;
