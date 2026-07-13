use std::net::SocketAddr;

use starcdn::{app::build_app, config::Config};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = Config::from_env();
    let addr: SocketAddr = if config.addr.starts_with(':') {
        format!("0.0.0.0{}", config.addr).parse()?
    } else {
        config.addr.parse()?
    };
    let app = build_app(config).await?;
    let listener = tokio::net::TcpListener::bind(addr).await?;
    println!("StarCDN Rust listening on {}", addr);
    axum::serve(listener, app).await?;
    Ok(())
}
