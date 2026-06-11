package site.jejinni.server.domain.education.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import site.jejinni.server.global.entity.BaseEntity;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "educations")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Education extends BaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	@Column(name = "education_id", columnDefinition = "UUID")
	private UUID id;

	@Column(name = "education", nullable = false, length = 200)
	private String education;

	@Column(name = "start_date", nullable = false)
	private LocalDate startDate;

	@Column(name = "end_date", nullable = false)
	private LocalDate endDate;

	@Column(name = "status", nullable = false, length = 50)
	private String status;

	@Column(name = "description", columnDefinition = "TEXT")
	private String description;

	@Column(name = "order_index", nullable = false)
	private Integer orderIndex;

	@Builder
	public Education(String education, LocalDate startDate, LocalDate endDate, String status, String description, Integer orderIndex) {
		this.education = education;
		this.startDate = startDate;
		this.endDate = endDate;
		this.status = status;
		this.description = description;
		this.orderIndex = orderIndex != null ? orderIndex : 0;
	}

	public void updateEducation(String education) {
		this.education = education;
	}

	public void updateStartDate(LocalDate startDate) {
		this.startDate = startDate;
	}

	public void updateEndDate(LocalDate endDate) {
		this.endDate = endDate;
	}

	public void updateStatus(String status) {
		this.status = status;
	}

	public void updateDescription(String description) {
		this.description = description;
	}

	public void updateOrderIndex(Integer orderIndex) {
		this.orderIndex = orderIndex != null ? orderIndex : 0;
	}
}
