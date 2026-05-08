export function verificationEmailTemplate(url: string, name?: string) {
  const displayName = name?.trim() || 'Explorer';

  return `
  <div style="font-family: Arial, sans-serif; background:#f8fafc; padding:40px;">
    
    <div style="max-width:600px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;border:2px solid #0f172a;">
      
      <div style="background:#10b981;padding:20px;text-align:center;">
        <h1 style="color:white;margin:0;font-size:22px;font-weight:800;">
          🌟 Little Explorer
        </h1>
        <p style="color:#ecfdf5;margin:5px 0 0;font-size:14px;">
          Adventure starts with a verified account
        </p>
      </div>

      <div style="padding:30px;color:#0f172a;">

        <h2 style="margin-top:0;font-size:20px;">
          Hello ${displayName} 👋
        </h2>

        <p style="font-size:15px;line-height:1.6;">
          You're almost ready to begin your journey. Please verify your email to activate your account and unlock enrollment.
        </p>

        <div style="text-align:center;margin:30px 0;">
          <a href="${url}" 
             style="
               background:#10b981;
               color:white;
               padding:14px 28px;
               text-decoration:none;
               border-radius:10px;
               font-weight:700;
               display:inline-block;
               font-size:16px;
               box-shadow:4px 4px 0px #0f172a;
             ">
            Verify Email Address
          </a>
        </div>

        <p style="font-size:13px;color:#64748b;">
          If the button doesn't work, copy and paste this link:
        </p>

        <p style="font-size:12px;word-break:break-all;color:#0ea5e9;">
          ${url}
        </p>

        <hr style="margin:30px 0;border:none;border-top:1px solid #e2e8f0;" />

        <p style="font-size:12px;color:#64748b;">
          If you didn’t create this account, you can safely ignore this email.
        </p>

      </div>

      <div style="background:#f1f5f9;padding:15px;text-align:center;font-size:12px;color:#64748b;">
        © ${new Date().getFullYear()} Little Explorer
      </div>

    </div>
  </div>
  `;
}