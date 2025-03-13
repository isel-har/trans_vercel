const logoutFunc = async () => {
    try {
      let p = await fetch("http://localhost:8000/api/auth/logout/", {
        method: "post",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
    deleteCookie("token");
    setToken(undefined);
  };