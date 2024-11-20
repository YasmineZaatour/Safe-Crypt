import React from "react";
import facebook from "../Assets/facebook.png";
import googleI from "../Assets/googleI.png";

const SignUp = () => {
  return (
    <div class="w-[522px] h-[640px] mt-32 ml-[600px] p-5 bg-cyan text-center rounded-lg signUpContainer">
      <h2 class="text-white text-[40px] mb-[50px]">Register</h2>
      <p class="text-white text-[20px] mb-[10px] font-semibold">
      Add all information
      </p>
      <input
        class="block w-[380px] h-[45px] rounded-lg mb-4 border-none mx-auto px-3 text-black"
        type="text"
        placeholder="Full Name"
      />
      <input
        class="block w-[380px] h-[45px] rounded-lg mb-4 border-none mx-auto px-3 text-black"
        type="email"
        placeholder="Email"
      />
      <input
        class="block w-[380px] h-[45px] rounded-lg mb-4 border-none mx-auto px-3 text-black"
        type="password"
        placeholder="Password"
      />
      <input
        class="block w-[380px] h-[45px] rounded-lg mb-4 border-none mx-auto px-3 text-black"
        type="tel"
        placeholder="Phone Number"
      />
      <div class="flex items-center text-white mx-[53px] my-[10px] signUp-divider">
        <hr class="flex-1 border-none h-px bg-white" />
        <span class="px-[20px]">Or</span>
        <hr class="flex-1 border-none h-px bg-white" />
      </div>
      <div class="flex justify-center mt-[20px] mb-[40px] icons">
        <img
          class="w-[70px] h-[40px] mr-[4px] facebook-icon"
          className="facebook-icon"
          src={facebook}
          alt="Facebook logo"
          
        />
        <img
          class="w-[38px] h-[39px] mr-[6px] google-icon "
          className="google-icon"
          src={googleI}
          alt="Google logo"
        />
      </div>
      <button
        class="w-96 h-12 bg-customBlue rounded-lg border-none text-white text-lg font-bold signUp-btn"
      >
        Continue
      </button>
    </div>
  );
};

export default SignUp;
