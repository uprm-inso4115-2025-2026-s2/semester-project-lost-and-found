import { supabase } from "../supabaseClient";

const url = import.meta.env.VITE_SITE_URL || window.location.origin;

async function verificationemail(email: string){
    const{data, error} = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options:{
            emailRedirectTo: `${url}/auth/callback` //edit when sign up page is complete
        }
    });
    if(error){
        console.error("Error sending verification email:", error.message);
        return{success:false, error: error.message};
    }
    console.log("Verification email sent successfully to:", email);
    return{success: true, data};
}
export default verificationemail;
