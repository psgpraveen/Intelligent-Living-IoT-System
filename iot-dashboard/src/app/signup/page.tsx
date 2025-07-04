"use client";
import { useState } from "react";
import { post } from "../hooks/useApi";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [form,setForm]=useState({name:"",email:"",password:""}),[err,setErr]=useState("");
  const router=useRouter();

  const handle=(e:any)=>setForm({...form,[e.target.name]:e.target.value});
  const submit=async(e:any)=>{e.preventDefault();setErr("");
    try{await post("/auth/register",form);router.push("/login");}
    catch(e:any){setErr(e.response?.data?.message||"Signup failed");}
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={submit} className="card w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold">Sign Up</h2>
        <div><label>Name</label><input name="name" onChange={handle} className="input" required/></div>
        <div><label>Email</label><input name="email" type="email" onChange={handle} className="input" required/></div>
        <div><label>Password</label><input name="password" type="password" onChange={handle} className="input" required/></div>
        {err&&<p className="text-red-600">{err}</p>}
        <button type="submit" className="btn btn-primary w-full">Create Account</button>
      </form>
    </div>
  );
}
