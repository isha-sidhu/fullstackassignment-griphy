import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useUser } from "../contexts/UserContext";
import { CiBookmarkRemove } from "react-icons/ci";
import { FaSignOutAlt } from "react-icons/fa";
import { GrReturn } from "react-icons/gr";
import { db } from "../lib/firebase";
import {
  collection,
  doc,
  getDocs,
  deleteDoc,
  query,
  limit,
} from "firebase/firestore";

// Component to display user's liked GIFs
const LikedGIFs: React.FC = () => {
  // State to store the list of liked GIFs
  const [gifCollection, updateGifCollection] = useState<
    { id: string; url: string }[]
  >([]);
  const navigation = useRouter();
  const { user, logout } = useUser();

  // Function to handle user logout
  const performLogout = () => {
    logout();
    navigation.push("/");
  };

  useEffect(() => {
    // Ensure user is authenticated
    if (!user) {
      navigation.push("/");
      return;
    }

    // Fetch user's liked GIFs from the database
    const retrieveLiked = async () => {
      try {
        const userLikedRef = doc(collection(db, "liked"), user.uid);
        const gifRef = collection(userLikedRef, "gifs");
        const gifQuery = query(gifRef, limit(10));

        const snapshot = await getDocs(gifQuery);
        const fetchedGifs = snapshot.docs.map((doc) => {
          return { id: doc.id, url: doc.data().url };
        });
        updateGifCollection(fetchedGifs);
      } catch (error) {
        console.error("Error fetching liked GIFs:", error);
      }
    };

    retrieveLiked();
  }, [user]);

  // Copy GIF URL to clipboard
  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      alert("Gif copied!");
    });
  };

  // Remove GIF from liked GIFs
  const removeGif = async (gifId: string) => {
    if (!user) {
      alert("Login required to remove liked GIFs.");
      return;
    }

    try {
      const userLikedRef = doc(collection(db, "liked"), user.uid);
      const gifToRemoveRef = doc(collection(userLikedRef, "gifs"), gifId);
      await deleteDoc(gifToRemoveRef);
      updateGifCollection((prevGifs) =>
        prevGifs.filter((gif) => gif.id !== gifId)
      );
      alert("Removed from bookmarks.");
    } catch (error) {
      console.error("Error removing liked GIF:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex justify-between items-center p-4 bg-black text-white">
        <div className="flex space-x-4">
          <button
            onClick={() => navigation.push("/home")}
            className="p-4 rounded-full bg-red-500"
          >
            <GrReturn size={32} color="white" />
          </button>
          <button
            onClick={performLogout}
            className="p-4 rounded-full bg-gray-600"
          >
            <FaSignOutAlt size={32} color="white" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {gifCollection.map((gif) => (
          <div
            key={gif.id}
            className="border-2 border-gray-300 rounded-lg relative p-2 shadow-md"
            style={{ width: "220px", height: "220px" }}
          >
            <Image
              src={gif.url}
              width={220}
              height={220}
              alt="Liked GIF"
              unoptimized={true}
              onClick={() => copyLink(gif.url)}
            />
            <button
              onClick={() => removeGif(gif.id)}
              className="bg-red-600 text-white p-3 rounded-full absolute top-1 right-1"
            >
              <CiBookmarkRemove size={24} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LikedGIFs;
