package site.jejinni.server.domain.career.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;

import java.time.LocalDate;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "businesses")
@DiscriminatorValue("BUSINESS")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Business extends Career {

	@JdbcTypeCode(SqlTypes.ARRAY)
	@Column(name = "details", columnDefinition = "text[]")
	private String[] details;

	@Builder
	public Business(LocalDate startDate, LocalDate endDate, String company,
	                String department, String position, String[] skills,
	                Integer orderIndex, String[] details) {
		super(startDate, endDate, company, department, position, skills, orderIndex);
		this.details = details != null ? details : new String[0];
	}

	public void updateDetails(String[] details) {
		this.details = details != null ? details : new String[0];
	}
}

