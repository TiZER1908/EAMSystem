package ru.tizer1908.vkr.eam_system.security;

import io.jsonwebtoken.Claims;
import java.security.Key;
import java.util.Date;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {
	
	@Value("${jwt.secret}")
	private String secret;
	
	@Value("${jwt.expiration}")
	private long expiration;
	
	public String generateToken(UserDetails userDetails) {
		return Jwts.builder()
				.subject(userDetails.getUsername())
				.issuedAt(new Date())
				.expiration(new Date(System.currentTimeMillis() + expiration))
				.signWith(getSigningKey())
				.compact();
	}
	
	public String extractUsername(String token) {
		return extractClaim(token, Claims::getSubject);
	}
	
	public boolean isTokenValid(String token, UserDetails userDetails) {
		final String username = extractUsername(token);
		return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
	}
	
	private boolean isTokenExpired(String token) {
	    return extractExpiration(token).before(new Date());
	}
	
	public Date extractExpiration(String token) {
	    return extractClaim(token, Claims::getExpiration);
	}
	
	private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }
	
	private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
		final Claims claims = Jwts.parser()
				.verifyWith((SecretKey) getSigningKey())
				.build().parseSignedClaims(token)
				.getPayload();
		return claimsResolver.apply(claims);
	}
}
