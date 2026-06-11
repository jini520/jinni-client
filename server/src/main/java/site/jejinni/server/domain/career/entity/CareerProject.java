package site.jejinni.server.domain.career.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "career_projects")
@DiscriminatorValue("PROJECT")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CareerProject extends Career {

	@Builder
	public CareerProject(LocalDate startDate, LocalDate endDate, String company,
	                     String department, String position, String[] skills,
	                     Integer orderIndex) {
		super(startDate, endDate, company, department, position, skills, orderIndex);
	}
}

