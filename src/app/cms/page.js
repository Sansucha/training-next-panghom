"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function CMS() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchPosts();
  }, []);

  function formValidation(titleStr) {
    const errs = {};
    const t = (titleStr ?? "").trim();
    if (t.length < 3 || t.length > 100) {
      errs.title = "Title must be between 3 and 100 characters";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function fetchPosts() {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("fetchPosts error:", error.message);
      setPosts([]);
      return;
    }
    setPosts(data ?? []);
  }

  async function addPost() {
    if (!formValidation(title)) return;
    const { error } = await supabase.from("posts").insert([{ title, description }]);
    if (error) {
      console.error("addPost error:", error.message);
      return;
    }
    setTitle("");
    setDescription("");
    await fetchPosts();
  }

  async function deletePost(id) {
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) {
      console.error("deletePost error:", error.message);
    }
    await fetchPosts();
  }

  return (
    <>
      <div>
        <h1 className="flex justify-center text-4xl font-bold my-5">Post Form</h1>

        <div className="flex flex-col gap-2 justify-center">
          <label htmlFor="title">Post Title</label>
          <input
            id="title"
            className="border border-gray-500 rounded-lg px-2 py-1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
          />
          {errors.title && <p className="text-red-500">{errors.title}</p>}

          <label htmlFor="desc">Post Description</label>
          <input
            id="desc"
            className="border border-gray-500 rounded-lg px-2 py-1"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
          />
        </div>

        <button
          className="border-2 border-green-500 py-1 px-2 my-5 cursor-pointer hover:bg-gray-300 rounded-lg"
          onClick={addPost}
        >
          Add Post
        </button>
      </div>

      <h1 className="flex justify-center text-4xl font-bold my-5">Post management</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {posts.map((post) => (
          <div key={post.id} className="border-2 border-gray-500 shadow-lg p-5">
            <div className="text-xl font-bold my-5">{post.title}</div>
            <div className="text-black line-clamp-2">{post.description}</div>
            <button
              className="border-2 border-green-500 py-1 px-1 cursor-pointer hover:bg-gray-300 rounded-lg"
              onClick={() => deletePost(post.id)}
            >
              Delete
            </button>
          </div>
        ))}
        {posts.length === 0 && <p className="text-gray-500">No posts yet.</p>}
      </div>
    </>
  );
}
