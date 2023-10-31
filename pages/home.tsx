import { useEffect, useState } from "react";
import Image from "next/image";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { CircularProgress, debounce } from "@mui/material";
import { useRouter } from "next/router";
import { useUser } from "../contexts/UserContext";
import { FaSignOutAlt } from "react-icons/fa";
import { CiBookmarkPlus } from "react-icons/ci";
import {
  collection,
  addDoc,
  doc,
  getDocs,
  where,
  query,
} from "firebase/firestore";
import { db } from "../lib/firebase";

// Define the GIF structure
type GifType = {
  id: string;
  title: string;
  images: {
    fixed_width: {
      url: string;
    };
  };
};

// Define the pagination structure
type PaginationType = {
  total_count: number;
  count: number;
  offset: number;
};

const DashboardComponent: React.FC = () => {
  // State management for search term, GIF list, pagination, and loading status
  const [term, updateTerm] = useState("");
  const [gifList, updateGifList] = useState<GifType[]>([]);
  const [pageData, updatePageData] = useState<PaginationType>({
    total_count: 0,
    count: 0,
    offset: 0,
  });
  const [loadingStatus, updateLoadingStatus] = useState(false);
  const navigation = useRouter();
  const { user, logout } = useUser();

  // Function to handle user logout
  const logoutUser = () => {
    logout();
    navigation.push("/");
  };

  // Function to search GIFs based on the term
  const searchGifs = async (pageIndex = 0) => {
    updateLoadingStatus(true);

    const API_KEY = "GlVGYHkr3WSBnllca54iNt0yFbjz7L65";
    const LIMIT = 10;
    const offsetValue = pageIndex * LIMIT;

    const apiResponse = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${term}&limit=${LIMIT}&offset=${offsetValue}`
    );
    const apiData = await apiResponse.json();

    if (apiData.meta && apiData.meta.status !== 200) {
      console.error("API Error:", apiData.meta.msg);
      return;
    }

    if (apiData && apiData.data && apiData.pagination) {
      updateGifList(apiData.data);
      updatePageData(apiData.pagination);
    } else {
      console.error("Unexpected API structure:", apiData);
    }
    updateLoadingStatus(false);
  };

  // Debounce the search function to prevent excessive API calls
  const debouncedSearch = debounce(searchGifs, 300);

  useEffect(() => {
    if (term) {
      debouncedSearch();
    }
  }, [term]);

  useEffect(() => {
    if (!user) {
      navigation.push("/");
    }
  }, [user, navigation]);

  // Function to add GIF to user's liked GIFs
  const addToLiked = async (gifURL: String) => {
    if (!user) {
      alert("Login required to save liked GIFs.");
      return;
    }
    try {
      const likedRef = collection(db, "liked");
      const userLikedRef = doc(likedRef, user.uid);
      const gifRef = collection(userLikedRef, "gifs");

      const snapshot = await getDocs(query(gifRef, where("url", "==", gifURL)));

      if (!snapshot.empty) {
        alert("GIF already in liked!");
      } else {
        await addDoc(gifRef, { url: gifURL });
        alert("GIF added to liked!");
      }
    } catch (error) {
      console.error("Error adding GIF:", error);
    }
  };

  // Function to copy GIF URL to clipboard
  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      alert("Link copied!");
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex justify-between items-center p-4 bg-black text-white">
        <div className="flex space-x-4">
          <button
            onClick={() => navigation.push("/liked")}
            className="p-4 rounded-full bg-red-500"
          >
            <CiBookmarkPlus size={32} color="white" />
          </button>
          <button onClick={logoutUser} className="p-4 rounded-full bg-gray-600">
            <FaSignOutAlt size={32} color="white" />
          </button>
        </div>
      </div>
      <div className="flex justify-between items-center my-4 p-4">
        <input
          type="text"
          value={term}
          onChange={(e) => updateTerm(e.target.value)}
          placeholder="Article Name or Keywords..."
          className="p-2 border rounded-md flex-grow mr-2"
        />
        <button
          onClick={() => searchGifs()}
          className="bg-black text-white p-2 rounded-md"
        >
          Search
        </button>
      </div>
      <div className="flex-grow overflow-y-auto">
        {loadingStatus ? (
          <CircularProgress />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5  gap-4">
            {gifList.map((gif) => (
              <div
                key={gif.id}
                className="border rounded-md relative p-2"
                style={{ width: "250px", height: "250px" }}
              >
                <button
                  onClick={() => addToLiked(gif.images.fixed_width.url)}
                  className="text-white p-2 rounded-md absolute bottom-0 right-0 bg-red-500"
                >
                  <CiBookmarkPlus color="white" />
                </button>
                <Image
                  src={gif.images.fixed_width.url}
                  width={250}
                  height={250}
                  alt={gif.title}
                  unoptimized={true}
                  onClick={() => copyLink(gif.images.fixed_width.url)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      {!loadingStatus && (
        <div className="p-4">
          <Stack spacing={2} justifyContent="center" alignItems="center">
            <Pagination
              count={Math.ceil(pageData.total_count / 10)}
              onChange={(event, page) => searchGifs(page - 1)}
              shape="rounded"
              variant="outlined"
            />
          </Stack>
        </div>
      )}
    </div>
  );
};

export default DashboardComponent;
