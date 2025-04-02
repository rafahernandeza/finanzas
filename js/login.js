document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const correo = document.getElementById('correoLogin').value;
    const contrasena = document.getElementById('contrasenaLogin').value;

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                correo: correo,
                contrasena: contrasena
            })
        });

        const data = await response.json();

        if (data.success) {
            // Guardar datos del usuario en localStorage
            localStorage.setItem('user', JSON.stringify({
                email: correo,
                loggedIn: true
            }));
            
            // Redirigir a index.html
            window.location.href = 'index.html';
        } else {
            alert(data.error || 'Credenciales incorrectas');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor');
    }
});